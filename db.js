// function that connect to the database 
const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/inotebook";

const connectToMongo = async () => {
  // mongoose.connect(mongoURI,()=>{
  //   console.log("Connected to mongoose successfully")
  // })

  //, { useNewUrlParser: true, useUnifiedTopology: true }
  await mongoose.connect(mongoURI);
  console.log("Connected to mongose successfully");
};

module.exports = connectToMongo;
