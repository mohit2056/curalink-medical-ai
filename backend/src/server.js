const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');

dotenv.config();
// Connect to Database
connectDB();

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'https://curalink-medical-ai-tan.vercel.app']
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Routes Import
const researchRoutes = require('./routes/researchRoutes');

// API Endpoints
app.use('/api/research', researchRoutes);

app.get('/', (req, res) => {
    res.send('Curalink Backend is Running Cleanly! 🚀');
});

app.listen(PORT, () => {
    console.log(`Server running on port: http://localhost:${PORT}`);
});