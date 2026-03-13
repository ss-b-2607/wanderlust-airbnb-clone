const express = require("express");
const app = express();
const mongoose = require("mongoose");

const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const schema = require("./schema.js");
const listingSchema = schema.listingSchema;

require("dotenv").config();

const url = process.env.MONGO_URL;

async function main() {
  try {
    await mongoose.connect(url);
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Error:", err);
  }
}

main()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


// VALIDATION MIDDLEWARE
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    throw new ExpressError(400, error);
  }
  next();
};


// HOME ROUTE
app.get("/", (req, res) => {
  res.redirect("/listings");
});


// INDEX ROUTE
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));


// FILTER ROUTE (NEW)
// FILTER ROUTE
app.get("/listings/filter/:category", wrapAsync(async (req,res)=>{
  let {category} = req.params;

  let allListings = await Listing.find({category});

  if(allListings.length === 0){
      allListings = await Listing.find({});
  }

  res.render("listings/index.ejs",{allListings});
}));


// NEW LISTING PAGE
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});


// CREATE LISTING
app.post("/listings/create",
  validateListing,
  wrapAsync(async (req, res) => {

    const listingData = req.body.listing;

    if (listingData.image) {
      listingData.image = { url: listingData.image };
    }

    const newListing = new Listing(listingData);
    await newListing.save();

    res.redirect("/listings");
  })
);


// EDIT PAGE
app.get("/listings/:id/edit",
  wrapAsync(async (req, res) => {

    let { id } = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs", { listing });
  })
);


// SHOW ROUTE
app.get("/listings/:id",
  wrapAsync(async (req, res) => {

    let { id } = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/show.ejs", { listing });
  })
);


// UPDATE ROUTE
app.put("/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {

    const { id } = req.params;
    const listingData = req.body.listing;

    if (listingData.image) {
      listingData.image = { url: listingData.image };
    }

    await Listing.findByIdAndUpdate(id, listingData);

    res.redirect(`/listings/${id}`);
  })
);


// DELETE ROUTE
app.delete("/listings/:id",
  wrapAsync(async (req, res) => {

    let { id } = req.params;
    await Listing.findByIdAndDelete(id);

    res.redirect("/listings");
  })
);


// 404 HANDLER
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});


// ERROR HANDLER
app.use((err, req, res, next) => {

  let { statusCode = 500, message = "Something went wrong!" } = err;

  res.status(statusCode).render("error.ejs", { message });
});


// SERVER
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});