const { callGroqWithHistory } = require('./groq.service');
const { getPersonaChatPrompt } = require('../prompts/personaChat.prompt');

const chatWithPersona = async (persona, startup, messageHistory) => {
  const systemPrompt = getPersonaChatPrompt(persona, startup);
  return await callGroqWithHistory(systemPrompt, messageHistory, 0.9);
};

module.exports = { chatWithPersona };