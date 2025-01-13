import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const bookingSchema = new mongoose.Schema({
  userId: String,
  date: String,
  time: String,
}, {
  versionKey: false,
  collection: process.env.BOOKINGS_COLLECTION,
});

export default mongoose.model("Booking", bookingSchema);