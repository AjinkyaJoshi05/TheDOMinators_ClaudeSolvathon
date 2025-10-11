import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path";
import { fileURLToPath } from "url";

// If you want to get __dirname in ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express()

app.use(cors({
    origin : process.env.CROSS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "10mb"}))
app.use(express.urlencoded({extended : true, limit : "16mb"}))
app.use(express.static("public"))

app.use(cookieParser())

// Serve temp folder for dataset downloads
app.use("/temp", express.static(path.join(__dirname, "../public/temp")));

// router imports
import datasetRoutes from "./routes/dataset.routes.js";
import analysisRoutes from "./routes/analysis.router.js";
import explainRoutes from "./routes/explain.router.js";

// use routes
app.use("/api/dataset", datasetRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/explain", explainRoutes);


export { app }