const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");


router.get("/restaurant/:id", async (req, res) => {
  try {
    let { id } = req.params; 

    console.log("Searching for restaurant ID:", id); 
    
    const restaurant = await Restaurant.aggregate([
      { $unwind: "$restaurants" }, 
      { $match: { "restaurants.restaurant.id": id } }, 
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

    
    console.log("Restaurant found:", restaurant); 

    if (restaurant.length === 0) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json(restaurant[0]); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching restaurant data" });
  }
});

module.exports = router;
