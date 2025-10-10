import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin : process.env.CROSS_ORIGIN,
    credentials : true
}))

<<<<<<< HEAD
app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true, limit : "16kb"}))
app.use(express.static("public"))

app.use(cookieParser())

// router imports
import datasetRoutes from "./routes/dataset.routes.js";
app.use("/api/dataset", datasetRoutes);
=======
// router import
import analysisRoutes from "./routes/analysis.router.js";


// router usage 
app.use("/api/analysis", analysisRoutes);
>>>>>>> origin/gurmeet


export { app }