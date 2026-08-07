import mongoose from "mongoose";

// Function to Connect to the DB


async function connectToDB(){
    const dbUrl = process.env.DB_URL || "";
    if(!dbUrl){
       throw new Error("Connection URL not Found");
    }
    await mongoose.connect(dbUrl, {
         dbName: process.env.DB_NAME! || "pulseiq-ai",
    });
}

export async function connectDB(){
    try{
       await connectToDB();
    }catch(err){
        console.log("Error Connecting to DB", err);
    }
}