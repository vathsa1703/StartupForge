const express = require('express');
const router = express.Router();
const { runSimulationMonth, pitchToInvestor, getSimulation, getPostMortem } = require('../controllers/simulation.controller');

router.post('/run-month', runSimulationMonth);
router.post('/pitch', pitchToInvestor);
router.get('/:startupId', getSimulation);
router.get('/postmortem/:startupId', getPostMortem);

module.exports = router;