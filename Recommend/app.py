from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
import math
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity as sk_cosine_similarity
from sklearn.model_selection import train_test_split
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Kết nối MongoDB
# client = MongoClient("mongodb://localhost:27017/")
# db = client["my-social-network"]
client = MongoClient("mongodb+srv://dangngochai280306:123abc@cluster0.vq6y6wc.mongodb.net/viesocial?retryWrites=true&w=majority&appName=Cluster0")
db = client["viesocial"] 
# Collections
locations_collection = db["locations"]
ratings_collection = db["ratinglocations"]

# --- Content-Based setup ---

# Lấy dữ liệu location
locations = list(locations_collection.find())

# Tiền xử lý data description cho Content-based
descriptions = [loc["description"] for loc in locations]
custom_stop_words = ['của', 'và', 'là', 'theo', 'như', 'để', 'trong', 'có', 'một', 'này', 'với',
                     'nhưng', 'lại', 'thì', 'ra', 'nên', 'đã', 'được', 'rằng', 'nhất', 'ở', 'khi']

vectorizer = TfidfVectorizer(stop_words=custom_stop_words)
tfidf_matrix = vectorizer.fit_transform(descriptions)
cosine_sim = sk_cosine_similarity(tfidf_matrix, tfidf_matrix)

def get_top_n_recommendations(index, n=5):
    sim_scores = list(enumerate(cosine_sim[index]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:n+1]  # loại bỏ chính nó (index 0)
    indices = [i[0] for i in sim_scores]
    return indices

@app.route('/recommend/<int:index>', methods=['GET'])
def recommend_content(index):
    if index < 0 or index >= len(locations):
        return jsonify({"error": "Invalid index"}), 400

    top_indices = get_top_n_recommendations(index)
    recommendations = [{
        "id": locations[i]["id"],
        "_id": str(locations[i]["_id"]),
        "name": locations[i]["name"],
        "location": locations[i]["location"],
        "rating": locations[i]["rating"],
        "description": locations[i]["description"],
        "imageUrl": locations[i]["imageUrl"]
    } for i in top_indices]

    return jsonify({
        "query_location": locations[index]["name"],
        "recommendations": recommendations
    })

# --- Collaborative Filtering setup ---

def cosine_similarity(ratings1, ratings2):
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
    from collections import defaultdict
    import random

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
    ratings = list(ratings_collection.find({}))
    
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
        return jsonify({"userId": user_id, "recommendations": [], "message": "User not in train data"})

    target_ratings = user_ratings[user_id]

    # Tính similarity với các user khác
    similarities = {}
    for other_uid, other_ratings in user_ratings.items():
        if other_uid == user_id:
            continue
        sim = cosine_similarity(target_ratings, other_ratings)
        if sim > 0:
            similarities[other_uid] = sim

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
        score = scores[loc] / sim_sums[loc]
        location_obj = locations_collection.find_one({"_id": ObjectId(loc)})
        if location_obj:
            location_obj["_id"] = str(location_obj["_id"])
            recommendations.append({
                "locationId": loc,
                "score": score,
                "locationInfo": location_obj
            })
        else:
            recommendations.append({
                "locationId": loc,
                "score": score
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
            "precision": precision,
            "recall": recall,
            "hits": hits,
            "test_items_count": len(test_locs)
        }
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
