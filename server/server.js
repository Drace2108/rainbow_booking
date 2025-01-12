import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const port = 3000;

const maximumBookingsPerDay = 2;

const mongodbUri = process.env.MONGODB_URI;
const databaseName = process.env.DATABASE_NAME;
const collectionName = process.env.COLLECTION_NAME;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongodbUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function addBookingToDb(booking) {
  try {
    // Connect the client to the server
    await client.connect();
    
    // Access the bookings collection
    const database = client.db(databaseName);
    const bookingsCollection = database.collection(collectionName);
    
    // Insert the booking into the database
    const result = await bookingsCollection.insertOne(booking);
    console.log(`New booking created with the following id: ${result.insertedId}`);
  } catch (error) {
    console.error('Error adding booking to database:', error);
  }
}

async function getBookings(userId) {
  try {
    // Connect the client to the server
    await client.connect();
    
    // Access the bookings collection
    const database = client.db(databaseName);
    const bookingsCollection = database.collection(collectionName);
    
    // Retrieve bookings from the database, filtering by userId if provided
    const query = userId ? { userId: userId } : {};
    const bookings = await bookingsCollection.find(query).toArray();
    console.log(`Retrieved ${bookings.length} bookings.`);
    return bookings;
  } catch (error) {
    console.error('Error retrieving bookings from database:', error);
  }
}

async function findBookingbyDateAndTime(date, time) {
  try {
    // Connect the client to the server
    await client.connect();
    
    // Access the bookings collection
    const database = client.db(databaseName);
    const bookingsCollection = database.collection(collectionName);
    
    const existingBooking = await bookingsCollection.findOne({ date: date, time: time });
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
    // Connect the client to the server
    await client.connect();
    
    // Access the bookings collection
    const database = client.db(databaseName);
    const bookingsCollection = database.collection(collectionName);
    
    const existingBooking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
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
    // Connect the client to the server
    await client.connect();
    
    // Access the bookings collection
    const database = client.db(databaseName);
    const bookingsCollection = database.collection(collectionName);
    
    // Retrieve all bookings from the database
    const userBookingsCount = await bookingsCollection.countDocuments({ userId: userId, date: date });
    console.log(`Retrieved ${userBookingsCount} bookings of user ${userId} on ${date}.`);
    return userBookingsCount;
  } catch (error) {
    console.error('Error retrieving bookings from database:', error);
  }
}

async function deleteBooking(booking) {
  try {
    // Connect the client to the server
    await client.connect();
    
    // Access the bookings collection
    const database = client.db(databaseName);
    const bookingsCollection = database.collection(collectionName);
    
    // Delete the booking from the database
    const result = await bookingsCollection.deleteOne({ date: booking.date, time: booking.time });
    console.log(`Booking deleted with the following id: ${result.deletedCount}`);
  } catch (error) {
    console.error('Error deleting booking from database:', error);
  }
}

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
run().catch(console.dir);

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

  const exists = await findBookingbyDateAndTime(newBooking.date, newBooking.time);
  if (exists !== null) {
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
  
  if (booking === null) {
    return res.status(404).json({ error: `Booking with id ${bookingId} not found` });
  }
  else if (booking.userId !== userId) {
    return res.status(403).json({ error: `You are not authorized to delete this booking` });
  }
  
  await deleteBooking(booking);
  res.status(200).json({ message: `Booking with id ${bookingId} deleted successfully by user ${userId}` });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});