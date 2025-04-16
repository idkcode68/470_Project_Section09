import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js'; // This will now work correctly
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoutes.js'; // Import user routes

dotenv.config();

connectDB(); 
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded requests
app.use(cookieParser()); // Middleware to parse cookies

//Routes
app.use("/api/users", userRoutes); // Use user routes for /api/users endpoint


app.listen(PORT, () => {
  console.log(`Server started at https://localhost:${PORT}`);
});