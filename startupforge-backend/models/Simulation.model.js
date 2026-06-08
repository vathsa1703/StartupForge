const mongoose = require('mongoose');

const metricsSchema = new mongoose.Schema({
  MRR: { type: Number, default: 0 },
  ARR: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  burnRate: { type: Number, default: 0 },
  runway: { type: Number, default: 12 },
  churn: { type: Number, default: 0 },
  totalFunding: { type: Number, default: 0 },
});

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  optionChosen: String,
  outcome: String,
});

const monthSchema = new mongoose.Schema({
  month: Number,
  actionsChosen: [String],
  eventFired: eventSchema,
  metricsSnapshot: metricsSchema,
  narrative: String,
});

const investorSchema = new mongoose.Schema({
  name: String,
  type: String,
  status: {
    type: String,
    enum: ['not_pitched', 'rejected', 'soft_pass', 'counter_offer', 'invested'],
    default: 'not_pitched',
  },
  response: String,
  amountOffered: Number,
  equity: Number,
});

const simulationSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: true,
    },
    currentMonth: { type: Number, default: 1 },
    metrics: metricsSchema,
    monthlyHistory: [monthSchema],
    investors: [investorSchema],
    status: {
      type: String,
      enum: ['active', 'failed', 'completed'],
      default: 'active',
    },
    postMortem: {
      verdict: String,
      founderScore: {
        productInstinct: Number,
        financialDiscipline: Number,
        marketAwareness: Number,
        resilience: Number,
        pitchQuality: Number,
      },
      realWorldProbability: Number,
      summary: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Simulation', simulationSchema);