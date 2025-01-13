import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import Booking from "./Models/BookingModel.js"

dotenv.config();

const app = express();
const port = 3000;

const maximumBookingsPerDay = 2;

const mongodbUri = process.env.MONGODB_URI;
const databaseName = process.env.DATABASE_NAME;
const collectionName = process.env.COLLECTION_NAME;

mongoose
  .connect(mongodbUri, { dbName: databaseName })
  .then(() => console.log("MongoDB is connected successfully"))
  .catch((err) => console.error(err));

async function addBookingToDb(booking) {
  try {
    const newBooking = new Booking(booking);
    await newBooking.save();
    console.log(`New booking created with the following id: ${newBooking._id}`);
  } catch (error) {
    console.error('Error adding booking to database:', error);
  }
}

async function getBookings(userId) {
  try {
    const query = userId ? { userId } : {};
    const bookings = await Booking.find(query);
    console.log(`Retrieved ${bookings.length} bookings.`);
    return bookings;
  } catch (error) {
    console.error('Error retrieving bookings from database:', error);
  }
}

async function findBookingByDateAndTime(date, time) {
  try {
    const existingBooking = await Booking.findOne({ date, time });
    if (existingBooking) {
      console.log(`Booking found with the following id: ${existingBooking._id}`);
    } else {
      console.log('Such record does not exist.');
    }
    return existingBooking;
  } catch (error) {
    console.error('Error retrieving bookings from database:', error);
  }
}

async function findBookingById(bookingId) {
  try {
    const existingBooking = await Booking.findOne({ _id: bookingId });
    if (existingBooking) {
      console.log(`Booking found with the following id: ${existingBooking._id}`);
    } else {
      console.log('Such record does not exist.');
    }
    return existingBooking;
  } catch (error) {
    console.error('Error retrieving bookings from database:', error);
  }
}

async function countUserBookings(userId, date) {
  try {
    const userBookingsCount = await Booking.countDocuments({ userId, date });
    console.log(`Retrieved ${userBookingsCount} bookings of user ${userId} on ${date}.`);
    return userBookingsCount;
  } catch (error) {
    console.error('Error retrieving bookings from database:', error);
  }
}

async function deleteBooking(booking) {
  try {
    const result = await Booking.deleteOne({ _id: booking._id });
    console.log(`Booking deleted with the following id: ${result.deletedCount}`);
  } catch (error) {
    console.error('Error deleting booking from database:', error);
  }
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to my server!');
});

app.get('/bookings', async (req, res) => {
  const userId = req.query.userId;
  const bookings = await getBookings(userId);
  res.status(200).json(bookings);
});

app.post('/book', async (req, res) => {
  const newBooking = req.body;

  const exists = await findBookingByDateAndTime(newBooking.date, newBooking.time);
  if (exists) {
    return res.status(400).json({ error: `Booking already exists for ${newBooking.date} at ${newBooking.time}` });
  }

  const userBookingsCount = await countUserBookings(newBooking.userId, newBooking.date);
  if (userBookingsCount >= maximumBookingsPerDay) {
    return res.status(400).json({ error: `Maximum bookings per day is ${maximumBookingsPerDay}` });
  }

  await addBookingToDb(newBooking).catch(console.dir);
  res.status(201).json(newBooking);
});

app.delete('/bookings/:id', async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.query.userId;
  const booking = await findBookingById(bookingId);

  if (!booking) {
    return res.status(404).json({ error: `Booking with id ${bookingId} not found` });
  } else if (booking.userId !== userId) {
    return res.status(403).json({ error: `You are not authorized to delete this booking` });
  }

  await deleteBooking(booking);
  res.status(200).json({ message: `Booking with id ${bookingId} deleted successfully by user ${userId}` });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});