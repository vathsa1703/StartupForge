const { callGroq } = require('./groq.service');
const { getMarketAnalysisPrompt } = require('../prompts/marketAnalysis.prompt');

const generateMarketAnalysis = async (startup) => {
  const { system, user } = getMarketAnalysisPrompt(startup);
  const raw = await callGroq(system, user, 0.6);

  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    throw new Error('Failed to parse market analysis from AI');
  }
};

module.exports = { generateMarketAnalysis };