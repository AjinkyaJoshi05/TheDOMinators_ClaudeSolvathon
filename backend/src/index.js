import dotenv from "dotenv";
dotenv.config( {path : "./.env"} );
import { app } from "./app.js";
import  connectDB  from "./db/index.js"

connectDB()
.then(()=>{
    app.on("error", (error)=>{
        console.log("Error :", error);
        throw error;
    })
    app.listen(process.env.PORT || 4000, ()=>{
        console.log(`Server is listening on port ${process.env.PORT || 4000}`);
    })
})
.catch((err)=>{
    console.log("Database connection FAILED !!", err);
    throw err
})