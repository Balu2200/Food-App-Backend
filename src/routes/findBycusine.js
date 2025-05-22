const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");

router.get("/findByCuisine", async (req, res) => {
  console.log("cusine root called");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9; 
    const skip = (page - 1) * limit;
    const cuisineFilter = req.query.cuisine
      ? req.query.cuisine.toLowerCase()
      : null;

    if (!cuisineFilter) {
      return res.status(400).json({ error: "Cuisine parameter is required" });
    }


    const rawData = await Restaurant.aggregate([
      { $unwind: "$restaurants" },
      {
        $project: {
          _id: 0,
          name: "$restaurants.restaurant.name",
          id: "$restaurants.restaurant.R.res_id",
          cuisines: { $toLower: "$restaurants.restaurant.cuisines" }, 
          user_rating: "$restaurants.restaurant.user_rating",
          average_cost_for_two: "$restaurants.restaurant.average_cost_for_two",
          location: "$restaurants.restaurant.location.address",
          featured_image: "$restaurants.restaurant.featured_image",
          latitude: { $toDouble: "$restaurants.restaurant.location.latitude" },
          longitude: {
            $toDouble: "$restaurants.restaurant.location.longitude",
          },
        },
      },
      {
        $match: {
          cuisines: { $regex: new RegExp(`\\b${cuisineFilter}\\b`, "i") }, 
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await Restaurant.aggregate([
      { $unwind: "$restaurants" },
      {
        $project: {
          cuisines: { $toLower: "$restaurants.restaurant.cuisines" },
        },
      },
      {
        $match: {
          cuisines: { $regex: new RegExp(`\\b${cuisineFilter}\\b`, "i") },
        },
      },
      { $count: "total" },
    ]);

    const totalRestaurants = total.length > 0 ? total[0].total : 0;
    const totalPages = Math.ceil(totalRestaurants / limit);

    if (rawData.length === 0) {
      return res
        .status(404)
        .json({ error: "No restaurants found for this cuisine" });
    }

    res.json({
      restaurants: rawData,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalResults: totalRestaurants,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching restaurant data" });
  }
});

module.exports = router;
