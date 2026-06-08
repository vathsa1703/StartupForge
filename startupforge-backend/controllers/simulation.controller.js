const Startup = require('../models/Startup.model');
const Simulation = require('../models/Simulation.model');
const { runMonth, pitchInvestor, generatePostMortem } = require('../services/simulation.service');

const runSimulationMonth = async (req, res, next) => {
  try {
    const { startupId, actionsChosen, eventOptionChosen } = req.body;

    const startup = await Startup.findById(startupId);
    const simulation = await Simulation.findOne({ startupId });

    if (!startup || !simulation) return res.status(404).json({ success: false, message: 'Not found' });
    if (simulation.status !== 'active') return res.status(400).json({ success: false, message: 'Simulation is over' });

    const result = await runMonth(startup, simulation.metrics, actionsChosen, simulation.currentMonth);

    simulation.monthlyHistory.push({
      month: simulation.currentMonth,
      actionsChosen,
      eventFired: result.eventFired || null,
      metricsSnapshot: result.updatedMetrics,
      narrative: result.narrative,
    });

    simulation.metrics = result.updatedMetrics;
    simulation.currentMonth += 1;

    if (simulation.metrics.runway <= 0) simulation.status = 'failed';
    if (simulation.currentMonth > 12) simulation.status = 'completed'

    await simulation.save();

    res.json({ success: true, data: { result, simulation } });
  } catch (err) {
    next(err);
  }
};

const pitchToInvestor = async (req, res, next) => {
  try {
    const { startupId, investorName, pitch } = req.body;

    const startup = await Startup.findById(startupId);
    const simulation = await Simulation.findOne({ startupId });

    if (!startup || !simulation) return res.status(404).json({ success: false, message: 'Not found' });
    if (simulation.currentMonth < 3) return res.status(400).json({ success: false, message: 'Too early to pitch. Build traction first.' });

    const result = await pitchInvestor(investorName, startup, simulation, pitch);

    const investor = simulation.investors.find(i => i.name === investorName);
    if (investor) {
      investor.status = result.status;
      investor.response = result.response;
      investor.amountOffered = result.amountOffered;
      investor.equity = result.equity;
    }

    if (result.status === 'invested' && result.amountOffered) {
      simulation.metrics.totalFunding += result.amountOffered;
      simulation.metrics.runway = Math.floor(
        (simulation.metrics.totalFunding) / simulation.metrics.burnRate
      );
    }

    await simulation.save();

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getSimulation = async (req, res, next) => {
  try {
    const simulation = await Simulation.findOne({ startupId: req.params.startupId });
    if (!simulation) return res.status(404).json({ success: false, message: 'Simulation not found' });
    res.json({ success: true, data: simulation });
  } catch (err) {
    next(err);
  }
};

const getPostMortem = async (req, res, next) => {
  try {
    const startup = await Startup.findById(req.params.startupId);
    const simulation = await Simulation.findOne({ startupId: req.params.startupId });

    if (!startup || !simulation) return res.status(404).json({ success: false, message: 'Not found' });
    if (simulation.status === 'active') return res.status(400).json({ success: false, message: 'Simulation still running' });

    if (simulation.postMortem?.verdict) {
      return res.json({ success: true, data: simulation.postMortem });
    }

    const postMortem = await generatePostMortem(startup, simulation);
    simulation.postMortem = postMortem;
    await simulation.save();

    res.json({ success: true, data: postMortem });
  } catch (err) {
    next(err);
  }
};

module.exports = { runSimulationMonth, pitchToInvestor, getSimulation, getPostMortem };