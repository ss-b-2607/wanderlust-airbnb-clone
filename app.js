const express = require("express");
const app = express();
const mongoose = require("mongoose");

const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");


const url = process.env.MONGO_URL;

async function main(){
    await mongoose.connect(url);
}

main().then(()=>{
    console.log("Connected to db");
}).catch((err)=>{
    console.log(err);
});
app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname,"/public")));


const validateListing = (req,res,next)=>{
    const {error}=listingSchema.validate(req.body);
    //  console.log(error);
    if(error){
        // const errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error);
    }
        next();
    
};
app.get("/",(req,res)=>{
    res.send("Home Page");
});
// INDEX ROUTE 
app.get("/listings", wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});
    // console.log(allListings);
    res.render("listings/index.ejs",{allListings});
}));


// new add, create route 
app.get("/listings/new",(req,res)=>{
   res.render("listings/new.ejs");
});

// create and redirect to main page 
app.post("/listings/create",validateListing,wrapAsync( async (req, res, next) => {
    // let result = listingSchema.validate(req.body);
  
    const listingData = req.body.listing;

    if (listingData.image) {
      listingData.image = { url: listingData.image };
    }

    const newListing = new Listing(listingData);
    await newListing.save();
    res.redirect("/listings");
  
   
}));

// EDIT AND UPDATE ROUTE 
//EDIT 
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
   let {id} = req.params;
  const listing = await Listing.findById(id);  
  res.render("listings/edit.ejs",{listing});
}));


// SHOW ROUTE 
// /LISTINGS/:ID
app.get("/listings/:id",wrapAsync(async(req,res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs",{listing});
}));




// update route 
// app.put("/listings/:id",async(req,res)=>{
// let {id} = req.params;
//  await Listing.findByIdAndUpdate(id,{...req.body.listing});
//  res.redirect("/listings");
// });


app.put("/listings/:id",validateListing,wrapAsync( async (req, res) => {
  
   
   const { id } = req.params;
  const listingData = req.body.listing;

  // Fix image structure
  if (listingData.image) {
    listingData.image = { url: listingData.image };
  }

  await Listing.findByIdAndUpdate(
    id,
    listingData,
  );

  res.redirect(`/listings/${id}`);
}));


//DELETE ROUTE
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedListings = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page not found!"));
// });
// no longer exist
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});
// custom erorr handler
app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});
});


app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
});
