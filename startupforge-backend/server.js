require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const startupRoutes = require('./routes/startup.routes');
const personaRoutes = require('./routes/persona.routes');
const simulationRoutes = require('./routes/simulation.routes');
const investorRoutes = require('./routes/investor.routes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/startup', startupRoutes);
app.use('/api/persona', personaRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/investor', investorRoutes);

app.get('/health', (req, res) =>
  res.json({ status: 'ok' })
);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);