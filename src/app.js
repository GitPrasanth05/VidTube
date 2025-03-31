import express from "express";
import cors from "cors"; // which talks with the database
import cookieParser from "cookie-parser"; // it is used to parse the cookies
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // saying what all should access the backend
    credentials: true,
  })
);

//it is the common middleware
app.use(express.json({ limit: "16kb" })); //adding the size limit for the json files coming in
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); //it can access images from public folder
app.use(cookieParser()); //middleware to parse the cookies

//routes
import HealthCheckRoutes from "./routes/health.routes.js"; //importing the health check routes
import UserRoutes from "./routes/User.routes.js"; //importing the user routes
import { errorHandler } from "./middlewares/error.middlewares.js"; //importing the error handler middleware

app.use("/api/v1/healthCheck", HealthCheckRoutes);
app.use("/api/v1/users", UserRoutes); //using the user routes

app.use(errorHandler); //using the error handler middleware
export { app };
