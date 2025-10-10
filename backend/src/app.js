import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin : process.env.CROSS_ORIGIN,
    credentials : true
}))

// router import
import analysisRoutes from "./routes/analysis.routes.js";


// router usage
app.use("/api/analysis", analysisRoutes);


export { app }