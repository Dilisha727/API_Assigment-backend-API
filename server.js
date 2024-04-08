const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

// Swagger options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather API',
      description: 'API to manage weather data for cities',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local server',
      },
    ],
  },
  apis: ['./server.js'], // Specify the file that contains your API routes
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// MongoDB connection
const DB_URL =
  'mongodb+srv://dilishapriyashan076:UIra6PFqvGxuwJqA@weather.0jbn01a.mongodb.net/?retryWrites=true&w=majority&appName=weather';

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log('DB connected');
    // Start updating weather data every 5 minutes
    setInterval(updateWeatherData, 5 * 60 * 1000); // 5 minutes interval
  })
  .catch((err) => console.log('DB connection error', err));

// Weather Schema and Model
const weatherSchema = new mongoose.Schema({
  id: Number,
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

// API endpoints
/**
 * @swagger
 * /api/weather:
 *   get:
 *     summary: Get all weather data
 *     responses:
 *       '200':
 *         description: A list of weather data for all cities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Weather'
 *   post:
 *     summary: Add new weather data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Weather'
 *     responses:
 *       '201':
 *         description: Weather data added successfully
 *       '500':
 *         description: Failed to add weather data
 */

/**
 * @swagger
 * /api/weather/{city}:
 *   get:
 *     summary: Get weather data by city
 *     parameters:
 *       - in: path
 *         name: city
 *         schema:
 *           type: string
 *         required: true
 *         description: City name to fetch weather data
 *     responses:
 *       '200':
 *         description: Weather data for the specified city
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Weather'
 *       '500':
 *         description: Failed to fetch weather data
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Weather:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         city:
 *           type: string
 *         temperature:
 *           type: number
 *         humidity:
 *           type: number
 *         airPressure:
 *           type: number
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         description:
 *           type: string
 */

// API endpoints implementation
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
  const { id, city, temperature, humidity, airPressure, latitude, longitude, description } = req.body;
  try {
    const newWeatherData = new Weather({
      id,
      city,
      temperature,
      humidity,
      airPressure,
      latitude,
      longitude,
      description,
    });
    await newWeatherData.save();
    res.status(201).json({ message: 'Weather data added successfully' });
  } catch (error) {
    console.error('Error adding weather data:', error);
    res.status(500).json({ error: 'Failed to add weather data' });
  }
});

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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
