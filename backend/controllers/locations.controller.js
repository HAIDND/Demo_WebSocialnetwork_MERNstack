const Locations = require("../models/Locations");
const RatingLocation = require("../models/RatingLocation");

// GET /api/locations hoặc /api/locations/:id
exports.getLocations = async (req, res) => {
  console.log("query get all location", req.query);
  try {
    const page = parseInt(req.query.page) || 1; // Mặc định trang 1
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const locations = await Locations.find()
      .sort({ createdAt: 1 }) // mới nhất lên trước
      .skip(skip)
      .limit(limit);

    const total = await Locations.countDocuments();

    const formattedLocations = locations.map((loc) => ({
      _id: loc._id,
      id: loc.id,
      name: loc.name,
      location: loc.location,
      description: loc.description,
      rating: loc.rating,
      imageUrl: loc.imageUrl,
    }));

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: formattedLocations,
    });
  } catch (error) {
    console.error("Error fetching paginated locations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/ratings
exports.postRatingLocation = async (req, res) => {
  try {
    const { userId, userEmail, locationId, locationName, rating, comment } =
      req.body;

    if (!userId || !userEmail || !locationId || !locationName || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Kiểm tra nếu rating đã tồn tại → cập nhật
    const existingRating = await RatingLocation.findOne({ userId, locationId });

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
      existingRating.createdAt = new Date();
      await existingRating.save();
      return res.json({ message: "Rating updated", rating: existingRating });
    }

    // Tạo mới
    const newRating = new RatingLocation({
      userId,
      userEmail,
      locationId,
      locationName,
      rating,
      comment,
    });

    await newRating.save();
    res.status(201).json({ message: "Rating saved", rating: newRating });
  } catch (error) {
    console.error("Error posting rating:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyRatingLocation = async (req, res) => {
  console.log("req.query", req.query);
  const locationId = req.query.locationId;
  const userId = req.query.userId;
  try {
    const myRating = await RatingLocation.find({
      locationId: locationId,
      userId: userId,
    }).exec();

    res.json({
      data: myRating[0],
      // id: myRating._id,
      // userId: myRating.userId,
      // userEmail: myRating.userEmail,
      // locationId: myRating.locationId,
      // locationName: myRating.locationName,
      // rating: myRating.rating,
      // comment: myRating.comment,
      // createdAt: myRating.createdAt,
    });
  } catch (error) {
    console.error("Error fetching paginated locations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRatingInLocation = async (req, res) => {
  console.log("req.query", req.query);
  try {
    const locationId = req.query.locationId;
    const page = parseInt(req.query.page) || 1; // Mặc định trang 1
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const ratings = await RatingLocation.find({
      locationId: locationId,
    })
      .sort({ createdAt: -1 }) // mới nhất lên trước
      .skip(skip)
      .limit(limit);

    const total = await RatingLocation.countDocuments();

    const formattedRatings = ratings.map((rate) => ({
      id: rate._id,
      userId: rate.userId,
      userEmail: rate.userEmail,
      locationId: rate.locationId,
      locationName: rate.locationName,
      rating: rate.rating,
      comment: rate.comment,
      createdAt: rate.createdAt,
    }));
    // res.json({ data: ratings });
    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: formattedRatings,
    });
  } catch (error) {
    console.error("Error fetching paginated ratings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// const skip = (page - 1) * limit;

// const locations = await Locations.find()
//   .sort({ createdAt: -1 }) // mới nhất lên trước
//   .skip(skip)
//   .limit(limit);

// const total = await Locations.countDocuments();

// const formattedLocations = locations.map((loc) => ({
//   _id: loc._id,
//   id: loc.id,
//   name: loc.name,
//   location: loc.location,
//   description: loc.description,
//   rating: loc.rating,
//   imageUrl: loc.imageUrl,
// }));

// res.json({
//   page,
//   limit,
//   total,
//   totalPages: Math.ceil(total / limit),
//   data: formattedLocations,
// });
