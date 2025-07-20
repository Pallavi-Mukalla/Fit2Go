const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');

// Define files and paths
const files = [
  {
    csvPath: './csv/InDiet_Dataset.csv',
    jsonPath: './json/InDiet_Dataset.json'
  },
  {
    csvPath: './csv/USDA.csv',
    jsonPath: './json/USDA.json'
  },
  {
    csvPath: './csv/workout_fitness_tracker_data.csv',
    jsonPath: './json/workout_fitness_tracker_data.json'
  }
];

const convertCSVtoJSON = async () => {
  try {
    for (const file of files) {
      const jsonArray = await csv().fromFile(file.csvPath);
      fs.writeFileSync(file.jsonPath, JSON.stringify(jsonArray, null, 2), 'utf-8');
      console.log(`Converted: ${path.basename(file.csvPath)}`);
    }
    console.log('All CSV files successfully converted to JSON.');
  } catch (err) {
    console.error('Error during conversion:', err);
  }
};

convertCSVtoJSON();
