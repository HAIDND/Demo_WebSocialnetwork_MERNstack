from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
import math
import random
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity as sk_cosine_similarity
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
#MONGO_URI=mongodb://localhost:27017/my-social-network
# Kết nối MongoDB Atlas
client = MongoClient("mongodb+srv://dangngochai280306:123abc@cluster0.vq6y6wc.mongodb.net/viesocial?retryWrites=true&w=majority&appName=Cluster0")
db = client["viesocial"] 
# client = MongoClient("mongodb://localhost:27017/my-social-network")
# db = client["viesocial"] 
# Collections
locations_collection = db["locations"]
ratings_collection = db["ratinglocations"]
 
# Global variables để cache dữ liệu
locations = []
tfidf_matrix = None
cosine_sim = None
vectorizer = None

def initialize_content_based():
    """Khởi tạo dữ liệu cho Content-Based Filtering"""
    global locations, tfidf_matrix, cosine_sim, vectorizer
    
    try:
        # Lấy dữ liệu location
        locations = list(locations_collection.find())
        
        if not locations:
            print("Warning: No locations found in database")
            return False
            
        # Tiền xử lý data description cho Content-based
        descriptions = [loc.get("description", "") for loc in locations]
        custom_stop_words = ['của', 'và', 'là', 'theo', 'như', 'để', 'trong', 'có', 'một', 'này', 'với',
                           'nhưng', 'lại', 'thì', 'ra', 'nên', 'đã', 'được', 'rằng', 'nhất', 'ở', 'khi']

        vectorizer = TfidfVectorizer(stop_words=custom_stop_words)
        tfidf_matrix = vectorizer.fit_transform(descriptions)
        cosine_sim = sk_cosine_similarity(tfidf_matrix, tfidf_matrix)
        
        print(f"Content-based filtering initialized with {len(locations)} locations")
        return True
        
    except Exception as e:
        print(f"Error initializing content-based filtering: {e}")
        return False

def get_top_n_recommendations(index, n=5):
    """Lấy top N recommendations dựa trên content similarity"""
    if cosine_sim is None:
        return []
        
    sim_scores = list(enumerate(cosine_sim[index]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:n+1]  # loại bỏ chính nó (index 0)
    indices = [i[0] for i in sim_scores]
    return indices

@app.route('/', methods=['GET'])
def home():
    """Endpoint kiểm tra trạng thái API"""
    return jsonify({
        "message": "Location Recommendation API is running",
        "endpoints": {
            "content_based": "/recommend/<int:index>",
            "collaborative_filtering": "/recommend-cf/<user_id>",
            "health_check": "/health"
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Kiểm tra kết nối database
        client.admin.command('ping')
        locations_count = locations_collection.count_documents({})
        ratings_count = ratings_collection.count_documents({})
        
        return jsonify({
            "status": "healthy",
            "database": "connected",
            "locations_count": locations_count,
            "ratings_count": ratings_count,
            "content_based_initialized": cosine_sim is not None
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route('/recommend/<int:index>', methods=['GET'])
def recommend_content(index):
    """Content-Based Filtering Recommendations"""
    if not locations or cosine_sim is None:
        # Thử khởi tạo lại nếu chưa được khởi tạo
        if not initialize_content_based():
            return jsonify({"error": "Content-based filtering not initialized"}), 500
    
    if index < 0 or index >= len(locations):
        return jsonify({"error": f"Invalid index. Must be between 0 and {len(locations)-1}"}), 400

    try:
        top_indices = get_top_n_recommendations(index)
        recommendations = []
        
        for i in top_indices:
            loc = locations[i]
            recommendations.append({
                "id": loc.get("id"),
                "_id": str(loc["_id"]),
                "name": loc.get("name", ""),
                "location": loc.get("location", ""),
                "rating": loc.get("rating", 0),
                "description": loc.get("description", ""),
                "imageUrl": loc.get("imageUrl", "")
            })

        return jsonify({
            "query_location": locations[index].get("name", ""),
            "query_index": index,
            "recommendations": recommendations
        })
        
    except Exception as e:
        return jsonify({"error": f"Error generating recommendations: {str(e)}"}), 500

def cosine_similarity(ratings1, ratings2):
    """Tính cosine similarity giữa 2 user"""
    sum_ab = 0
    sum_a2 = 0
    sum_b2 = 0
    
    for loc in ratings1:
        if loc in ratings2:
            a = ratings1[loc]
            b = ratings2[loc]
            sum_ab += a * b
            sum_a2 += a * a
            sum_b2 += b * b
            
    if sum_a2 == 0 or sum_b2 == 0:
        return 0
    return sum_ab / (math.sqrt(sum_a2) * math.sqrt(sum_b2))

def split_train_test_by_user(ratings, test_ratio=0.2):
    """Chia dữ liệu thành train và test theo user"""
    user_ratings_map = defaultdict(list)
    for r in ratings:
        user_ratings_map[str(r["userId"])].append(r)

    train, test = [], []

    for uid, user_ratings in user_ratings_map.items():
        if len(user_ratings) < 2:
            train.extend(user_ratings)  # không đủ để tách
            continue
        random.shuffle(user_ratings)
        cut = int(len(user_ratings) * (1 - test_ratio))
        train.extend(user_ratings[:cut])
        test.extend(user_ratings[cut:])
    return train, test

@app.route("/recommend-cf/<user_id>", methods=["GET"])
def recommend_cf(user_id):
    """Collaborative Filtering Recommendations"""
    try:
        ratings = list(ratings_collection.find({}))
        
        if not ratings:
            return jsonify({
                "userId": user_id, 
                "recommendations": [], 
                "message": "No ratings data available"
            })
        
        # Chia dữ liệu thành train và test
        train_ratings, test_ratings = split_train_test_by_user(ratings, test_ratio=0.2)

        # Tạo dict user_ratings từ train
        user_ratings = {}
        for r in train_ratings:
            uid = str(r["userId"])
            lid = str(r["locationId"])
            rating = r["rating"]
            if uid not in user_ratings:
                user_ratings[uid] = {}
            user_ratings[uid][lid] = rating

        if user_id not in user_ratings:
            return jsonify({
                "userId": user_id, 
                "recommendations": [], 
                "message": "User not found in training data"
            })

        target_ratings = user_ratings[user_id]

        # Tính similarity với các user khác
        similarities = {}
        for other_uid, other_ratings in user_ratings.items():
            if other_uid == user_id:
                continue
            sim = cosine_similarity(target_ratings, other_ratings)
            if sim > 0:
                similarities[other_uid] = sim

        if not similarities:
            return jsonify({
                "userId": user_id, 
                "recommendations": [], 
                "message": "No similar users found"
            })

        # Tính điểm đề xuất
        scores = {}
        sim_sums = {}

        for other_uid, sim in similarities.items():
            for loc, rating in user_ratings[other_uid].items():
                if loc not in target_ratings:
                    scores[loc] = scores.get(loc, 0) + rating * sim
                    sim_sums[loc] = sim_sums.get(loc, 0) + sim

        recommendations = []
        for loc in scores:
            if sim_sums[loc] > 0:
                score = scores[loc] / sim_sums[loc]
                try:
                    location_obj = locations_collection.find_one({"_id": ObjectId(loc)})
                    if location_obj:
                        location_obj["_id"] = str(location_obj["_id"])
                        recommendations.append({
                            "locationId": loc,
                            "score": round(score, 3),
                            "locationInfo": location_obj
                        })
                    else:
                        recommendations.append({
                            "locationId": loc,
                            "score": round(score, 3),
                            "locationInfo": None
                        })
                except Exception as e:
                    print(f"Error fetching location {loc}: {e}")
                    recommendations.append({
                        "locationId": loc,
                        "score": round(score, 3),
                        "locationInfo": None
                    })

        recommendations.sort(key=lambda x: x["score"], reverse=True)
        top_recommendations = recommendations[:5]

        # Đánh giá precision và recall trên tập test
        test_locs = set(str(r["locationId"]) for r in test_ratings if str(r["userId"]) == user_id)
        recommended_locs = set(r["locationId"] for r in top_recommendations)

        hits = len(test_locs.intersection(recommended_locs))
        precision = hits / len(top_recommendations) if top_recommendations else 0
        recall = hits / len(test_locs) if test_locs else 0

        return jsonify({
            "userId": user_id,
            "recommendations": top_recommendations,
            "evaluation": {
                "precision": round(precision, 3),
                "recall": round(recall, 3),
                "hits": hits,
                "test_items_count": len(test_locs)
            }
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Error in collaborative filtering: {str(e)}"
        }), 500

# Khởi tạo content-based filtering khi start app
print("Initializing content-based filtering...")
initialize_content_based()

if __name__ == "__main__":
    app.run(debug=False)  # Tắt debug mode cho production