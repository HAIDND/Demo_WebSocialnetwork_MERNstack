import csv
from pymongo import MongoClient

# Kết nối MongoDB Atlas
#MONGO_URI=mongodb+srv://dangngochai280306:123abc@cluster0.vq6y6wc.mongodb.net/viesocial?retryWrites=true&w=majority&appName=Cluster0

client = MongoClient("mongodb+srv://dangngochai280306:123abc@cluster0.vq6y6wc.mongodb.net/viesocial?retryWrites=true&w=majority&appName=Cluster0")
db = client["viesocial"]
collection = db["ratinglocations"]

# Đọc CSV và chuyển thành list dict
with open("my-social-network.locations.csv", newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    data = [row for row in reader]

# Chèn dữ liệu
if data:
    result = collection.insert_many(data)
    print(f"Đã chèn {len(result.inserted_ids)} dòng")
else:
    print("Không có dữ liệu để insert.")
