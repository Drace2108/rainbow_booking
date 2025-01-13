import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./Routes/AuthRoute.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = 3000;

mongoose
  .connect(MONGODB_URI, {dbName: process.env.DATABASE_NAME})
  .then(() => console.log("MongoDB is connected successfully"))
  .catch((err) => console.error(err));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());

app.use("/", authRoute);