const fs = require("fs");
const mongoose = require("mongoose");
const Locations = require("./Locations"); // Sửa đường dẫn nếu model ở chỗ khác
const { ObjectId } = mongoose.Types;

// Kết nối MongoDB
mongoose.connect(
  "mongodb+srv://dangngochai280306:123abc@cluster0.vq6y6wc.mongodb.net/viesocial?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function importLocations() {
  try {
    const rawData = fs.readFileSync("locations.json", "utf-8");
    const json = JSON.parse(rawData);

    const locations = json.map((loc) => ({
      // Không set _id để MongoDB tự tạo hoặc để bạn thêm nếu cần
      id: loc.id,
      name: loc.name,
      location: loc.location,
      description: loc.description,
      rating: parseFloat(loc.rating), // đảm bảo là số
      imageUrl: loc.imageUrl,
    }));

    const result = await Locations.insertMany(locations, { ordered: false });
    console.log(`✅ Đã chèn ${result.length} địa điểm.`);
  } catch (err) {
    console.error("❌ Lỗi khi insert locations:", err.message);
  } finally {
    mongoose.disconnect();
  }
}

importLocations();
