const Startup = require('../models/Startup.model');
const Simulation = require('../models/Simulation.model');
const ChatSession = require('../models/ChatSession.model');

const INVESTORS = require('../config/investors');

const { chatWithInvestor } = require('../services/investor.service');

const chat = async (req, res, next) => {
  try {
    console.log('INVESTOR CHAT HIT');

    const {
      startupId,
      investorId,
      message,
    } = req.body;

    const startup = await Startup.findById(startupId);

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'Startup not found',
      });
    }

    const simulation = await Simulation.findOne({
      startupId,
    });

    const investor = INVESTORS.find(
      (inv) => inv.id === investorId
    );

    if (!investor) {
      return res.status(404).json({
        success: false,
        message: 'Investor not found',
      });
    }

    let session = await ChatSession.findOne({
      startupId,
      investorId,
    });

    if (!session) {
      session = await ChatSession.create({
        startupId,
        investorId,
        messages: [],
      });
    }

    session.messages.push({
      role: 'user',
      content: message,
    });

    const history = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const reply = await chatWithInvestor(
      investor,
      startup,
      simulation,
      history
    );

    session.messages.push({
      role: 'assistant',
      content: reply,
    });

    await session.save();

    res.json({
      success: true,
      data: {
        reply,
        messages: session.messages,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const {
      startupId,
      investorId,
    } = req.params;

    const session = await ChatSession.findOne({
      startupId,
      investorId,
    });

    res.json({
      success: true,
      data: session?.messages || [],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  chat,
  getChatHistory,
};