import mongoose from "mongoose";

// Function to Connect to the DB
connectDB()
.then(()=>console.log("DB connected Successfully"))
.catch(err=>console.log("Error Occured: ", err))

async function connectDB(){
    const dbUrl = process.env.DB_URL || "";
    if(!dbUrl){
       throw new Error("Connection URL not Found");
    }
    await mongoose.connect(dbUrl);
}