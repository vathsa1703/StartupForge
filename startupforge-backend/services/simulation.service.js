const { callGroq } = require('./groq.service');
const { getSimulationPrompt, getInvestorPrompt, getPostMortemPrompt } = require('../prompts/simulation.prompt');

const INVESTORS = [
  { name: 'Arjun Mehta', type: 'Angel Investor' },
  { name: 'Sequoia Scout', type: 'Early Stage VC' },
  { name: 'Meera Iyer', type: 'Impact Investor' },
  { name: 'Raj Kapoor', type: 'Serial Entrepreneur' },
  { name: 'Tiger Global Associate', type: 'Growth Stage VC' },
];

const runMonth = async (startup, metrics, actionsChosen, currentMonth) => {
  const { system, user } = getSimulationPrompt(startup, metrics, actionsChosen, currentMonth);
  const raw = await callGroq(system, user, 0.7);

  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    throw new Error('Failed to parse simulation outcome from AI');
  }
};

const pitchInvestor = async (investorName, startup, simulation, pitch) => {
  const investor = INVESTORS.find(i => i.name === investorName);
  if (!investor) throw new Error('Investor not found');

  const { system, user } = getInvestorPrompt(investor, startup, simulation, pitch);
  const raw = await callGroq(system, user, 0.7);

  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    throw new Error('Failed to parse investor response from AI');
  }
};

const generatePostMortem = async (startup, simulation) => {
  const { system, user } = getPostMortemPrompt(startup, simulation);
  const raw = await callGroq(system, user, 0.6);

  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    throw new Error('Failed to parse post mortem from AI');
  }
};

module.exports = { runMonth, pitchInvestor, generatePostMortem, INVESTORS };