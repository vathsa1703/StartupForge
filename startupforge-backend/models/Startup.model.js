const mongoose = require('mongoose');

const competitorSchema = new mongoose.Schema({
  name: String,
  strengths: [String],
  weaknesses: [String],
});

const riskSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const personaSchema = new mongoose.Schema({
  name: String,
  age: Number,
  occupation: String,
  income: String,
  painPoints: [String],
  willingnessToPay: String,
  personality: String,
});

const startupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    targetAudience: { type: String, required: true },
    marketAnalysis: {
      TAM: String,
      SAM: String,
      SOM: String,
      competitors: [competitorSchema],
      risks: [riskSchema],
    },
    personas: [personaSchema],
    analysisGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Startup', startupSchema);