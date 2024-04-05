const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

DB_URL = 'mongodb+srv://dilishapriyashan076:UIra6PFqvGxuwJqA@weather.0jbn01a.mongodb.net/?retryWrites=true&w=majority&appName=weather';

mongoose.connect(DB_URL)
  .then(() => {
    console.log('DB connected');
    // Start updating weather data every 5 minutes
    setInterval(updateWeatherData, 5 * 60 * 1000); // 5 minutes interval
  })
  .catch((err) => console.log('DB connection error', err));

const weatherSchema = new mongoose.Schema({
  id : Number,
  city: String,
  temperature: Number,
  humidity: Number,
  airPressure: Number,
  latitude: Number,
  longitude: Number,
  description: String,
});
const Weather = mongoose.model('Weather', weatherSchema);

// Function to update weather data for all cities
// Define the interval in milliseconds (5 minutes = 300,000 milliseconds)
const updateInterval = 5 * 60 * 1000;

// Function to update weather data for all cities
async function updateWeatherData() {
  try {
    const cities = await Weather.find().distinct('city');
    cities.forEach(async (city) => {
      const updatedWeatherData = {
        temperature: Math.floor(Math.random() * 30 + 20),
        humidity: Math.floor(Math.random() * 50 + 50),
        airPressure: Math.floor(Math.random() * 1000 + 900),
        description: generateRandomDescription(),
      };
      await Weather.updateOne({ city }, updatedWeatherData);
    });
    console.log('Weather data updated for all cities');
  } catch (error) {
    console.error('Error updating weather data:', error);
  }
}

// Function to generate random description
function generateRandomDescription() {
  const descriptions = ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Foggy'];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Set the interval to update weather data every 5 minutes
setInterval(updateWeatherData, updateInterval);

// Initial call to updateWeatherData when the server starts
updateWeatherData();

// Start the server and other configurations...



// API endpoints
app.get('/api/weather/:city', async (req, res) => {
  const city = req.params.city;
  try {
    const weatherData = await Weather.findOne({ city });
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.post('/api/weather', async (req, res) => {
  const { id,city, temperature, humidity, airPressure, latitude, longitude,description } = req.body;
  try {
    const newWeatherData = new Weather({
      id,
      city,
      temperature,
      humidity,
      airPressure,
      latitude,
      longitude ,
      description,
    });
    await newWeatherData.save();
    res.status(201).json({ message: 'Weather data added successfully' });
  } catch (error) {
    console.error('Error adding weather data:', error);
    res.status(500).json({ error: 'Failed to add weather data' });
  }
});
// API endpoint to fetch all weather data
app.get('/api/weather', async (req, res) => {
  try {
    const allWeatherData = await Weather.find();
    res.json(allWeatherData);
  } catch (error) {
    console.error('Error fetching all weather data:', error);
    res.status(500).json({ error: 'Failed to fetch all weather data' });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
