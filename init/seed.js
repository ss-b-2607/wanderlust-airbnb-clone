const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const Listing = require("../models/listing");

const dbUrl = process.env.MONGO_URL;

console.log("Mongo URL:", dbUrl);   // test

async function connectDB() {
  await mongoose.connect(dbUrl);
  console.log("Database Connected");
}
const cities = [
  { city: "New York", country: "USA" },
  { city: "Los Angeles", country: "USA" },
  { city: "London", country: "UK" },
  { city: "Paris", country: "France" },
  { city: "Tokyo", country: "Japan" },
  { city: "Sydney", country: "Australia" },
  { city: "Dubai", country: "UAE" },
  { city: "Singapore", country: "Singapore" },
  { city: "Rome", country: "Italy" },
  { city: "Barcelona", country: "Spain" },
  { city: "Amsterdam", country: "Netherlands" },
  { city: "Berlin", country: "Germany" },
  { city: "Bangkok", country: "Thailand" },
  { city: "Istanbul", country: "Turkey" },
  { city: "Toronto", country: "Canada" },
  { city: "San Francisco", country: "USA" },
  { city: "Chicago", country: "USA" },
  { city: "Las Vegas", country: "USA" },
  { city: "Miami", country: "USA" },
  { city: "Delhi", country: "India" },
  { city: "Mumbai", country: "India" },
  { city: "Bangalore", country: "India" },
  { city: "Hyderabad", country: "India" },
  { city: "Chennai", country: "India" },
  { city: "Kolkata", country: "India" },
  { city: "Jaipur", country: "India" },
  { city: "Goa", country: "India" },
  { city: "Udaipur", country: "India" },
  { city: "Agra", country: "India" },
  { city: "Varanasi", country: "India" }
];

const titles = [
  "Luxury Villa",
  "Beachfront House",
  "Mountain Retreat",
  "Cozy Apartment",
  "Modern Studio",
  "Forest Cabin",
  "Lake View Home",
  "City Penthouse",
  "Budget Stay",
  "Private Resort"
];

const images = [
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb"
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedDB() {

  await Listing.deleteMany({});

  const listings = [];

  for (let i = 0; i < 100; i++) {

    const place = random(cities);

    listings.push({
      title: random(titles),
      description:
        "A beautiful place to stay with modern amenities, perfect for vacations and relaxing stays.",
      price: Math.floor(Math.random() * 5000) + 1000,
      location: place.city,
      country: place.country,
      image: {
        url: random(images)
      }
    });
  }

  await Listing.insertMany(listings);

  console.log("100 Listings Inserted Successfully");
}

connectDB()
  .then(seedDB)
  .then(() => mongoose.connection.close());