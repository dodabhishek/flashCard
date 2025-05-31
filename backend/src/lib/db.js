import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flashcard', {
            dbName: 'flashcard' // Explicitly set the database name to lowercase
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch(error){
        console.log(`Error in connecting to db : ${error}`);
        process.exit(1); // Exit process with failure
    }
};