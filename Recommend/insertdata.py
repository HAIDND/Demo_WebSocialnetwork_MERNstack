import json
from pymongo import MongoClient
from bson import ObjectId  # Thư viện hỗ trợ ObjectId

# Kết nối MongoDB
MONGO_URI = "mongodb+srv://dangngochai280306:123abc@cluster0.vq6y6wc.mongodb.net/viesocial?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["viesocial"]
collection = db["ratinglocations"]

# Load và chuyển đổi JSON
with open("my-social-network.locations.json", encoding="utf-8") as f:
    raw_data = json.load(f)

# Chuyển $oid -> ObjectId
data = []
for i, doc in enumerate(raw_data, start=1):
    try:
        if "_id" in doc and isinstance(doc["_id"], dict) and "$oid" in doc["_id"]:
            doc["_id"] = ObjectId(doc["_id"]["$oid"])
        data.append(doc)
    except Exception as e:
        print(f"Dòng {i}: lỗi xử lý ObjectId ({e}), bỏ qua.")

# Insert vào MongoDB
if data:
    try:
        result = collection.insert_many(data)
        print(f"✅ Đã chèn {len(result.inserted_ids)} documents.")
    except Exception as e:
        print(f"❌ Lỗi khi insert: {e}")
else:
    print("⚠️ Không có dữ liệu hợp lệ để insert.")
