import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin : process.env.CROSS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true, limit : "16kb"}))
app.use(express.static("public"))

app.use(cookieParser())

// router imports
import datasetRoutes from "./routes/dataset.routes.js";
import analysisRoutes from "./routes/analysis.router.js";
import explainRoutes from "./routes/explain.router.js";

// use routes
app.use("/api/dataset", datasetRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/explain", explainRoutes);



export { app }