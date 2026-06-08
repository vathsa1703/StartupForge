const Startup = require('../models/Startup.model');
const Simulation = require('../models/Simulation.model');
const { generateMarketAnalysis } = require('../services/analysis.service');
const { INVESTORS } = require('../services/simulation.service');

const createStartup = async (req, res, next) => {
  try {
    const { name, description, industry, targetAudience } = req.body;

    const startup = await Startup.create({ name, description, industry, targetAudience });

    const analysis = await generateMarketAnalysis(startup);

    startup.marketAnalysis = {
      TAM: analysis.TAM,
      SAM: analysis.SAM,
      SOM: analysis.SOM,
      competitors: analysis.competitors,
      risks: analysis.risks,
    };
    startup.personas = analysis.personas;
    startup.analysisGenerated = true;
    await startup.save();

    const initialInvestors = INVESTORS.map(inv => ({
      name: inv.name,
      type: inv.type,
      status: 'not_pitched',
    }));

    await Simulation.create({
      startupId: startup._id,
      metrics: {
        MRR: 0,
        ARR: 0,
        activeUsers: 0,
        burnRate: 50000,
        runway: 12,
        churn: 0,
        totalFunding: 500000,
      },
      investors: initialInvestors,
    });

    res.status(201).json({ success: true, data: startup });
  } catch (err) {
    next(err);
  }
};

const getStartup = async (req, res, next) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

    const simulation = await Simulation.findOne({ startupId: startup._id });

    res.json({ success: true, data: { startup, simulation } });
  } catch (err) {
    next(err);
  }
};

const getAllStartups = async (req, res, next) => {
  try {
    const startups = await Startup.find().sort({ createdAt: -1 });
    res.json({ success: true, data: startups });
  } catch (err) {
    next(err);
  }
};

module.exports = { createStartup, getStartup, getAllStartups };