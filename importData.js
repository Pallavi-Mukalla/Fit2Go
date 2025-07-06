// Load environment variables from .env file
require('dotenv').config();

const { MongoClient } = require('mongodb');
const fs = require('fs');

async function importData() {
  // Access the MongoDB URI from environment variables
  const uri = process.env.MONGO_URI; // This will load the URI from your .env file

  if (!uri) {
    console.log('MongoDB URI not found in environment variables!');
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    // Specify the database
    const db = client.db('Fit2Go'); // Replace with your database name

    // Import the first file
    const collection1 = db.collection('FOOD'); // Replace with the first collection name
    const data1 = JSON.parse(fs.readFileSync('E:\\FIT2GO\\json\\InDiet_Dataset.json', 'utf8')); // Replace with the correct file path
    await collection1.insertMany(data1);
    console.log('Data from file1 imported successfully');

    // Import the second file
    const collection2 = db.collection('NUTRITION'); // Replace with the second collection name
    const data2 = JSON.parse(fs.readFileSync('E:\\FIT2GO\\json\\USDA.json', 'utf8')); // Replace with the correct file path
    await collection2.insertMany(data2);
    console.log('Data from file2 imported successfully');

    // Import the third file
    const collection3 = db.collection('WORKOUT'); // Replace with the third collection name
    const data3 = JSON.parse(fs.readFileSync('E:\\FIT2GO\\json\\workout_fitness_tracker_data.json', 'utf8')); // Replace with the correct file path
    await collection3.insertMany(data3);
    console.log('Data from file3 imported successfully');
    
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await client.close();
  }
}

importData();
