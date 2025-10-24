const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const statisticsRoutes = require('./routes/statisticsRoutes');
app.use('/api/statistics', statisticsRoutes);

const telegramRoutes = require('./routes/telegramRoutes');
app.use('/api/telegram', telegramRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});