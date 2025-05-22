const express = require("express");
const { connectDb } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;


const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const restaurantRoute = require("./routes/resRoute");
const restaurantIDRoute = require("./routes/resbyIdRoute"); 
const restaurantDetailsRoute = require("./routes/details");
const findByAddressRoute = require("./routes/findByaddress");
const foodRoute = require("./routes/foodRoutes");
const findByCusineRoute = require("./routes/findBycusine");


app.use("/api/restaurants", restaurantRoute); 
app.use("/api/restaurants", restaurantIDRoute); 
app.use("/api/restaurants", restaurantDetailsRoute);

app.use("/api/restaurants", findByAddressRoute); 
app.use("/api", foodRoute); 
app.use("/api", findByCusineRoute); 

connectDb()
  .then(() => {
    console.log("Database Connected");

    app.listen(process.env.PORT || 1234, () => {
      console.log("Server started on port 1234...");
    });
  })
  .catch((err) => {
    console.log("Database Connection Error:", err.message);
  });
