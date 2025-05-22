const Restaurant = require("../models/Restaurant");

const getRestaurants = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", sortBy = "name" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: "i" } };
    }

    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query)
      .sort({ [sortBy]: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ total, page, limit, restaurants });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getRestaurants };
