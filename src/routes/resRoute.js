const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");


router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;

    const skip = (page - 1) * limit;

    const rawData = await Restaurant.aggregate([
      { $unwind: "$restaurants" },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          name: "$restaurants.restaurant.name",
          id: "$restaurants.restaurant.R.res_id",
          cuisines: "$restaurants.restaurant.cuisines",
          user_rating: "$restaurants.restaurant.user_rating",
          average_cost_for_two: "$restaurants.restaurant.average_cost_for_two",
          location: "$restaurants.restaurant.location.address",
          featured_image: "$restaurants.restaurant.featured_image",
        },
      },
    ]);

    const totalRestaurants = await Restaurant.aggregate([
      { $unwind: "$restaurants" },
      { $count: "total" },
    ]);

    const total = totalRestaurants[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    if (rawData.length === 0) {
      return res.status(404).json({ error: "No restaurant found" });
    }

    res.json({
      restaurants: rawData,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching restaurant data" });
  }
});

module.exports = router;
