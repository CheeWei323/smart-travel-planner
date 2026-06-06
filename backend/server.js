const express  = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const tripRoutes = require("./routes/tripRoutes");


connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use("/api/trips", tripRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Smart Travel Planner API Running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});