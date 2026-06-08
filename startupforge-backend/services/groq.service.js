const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const callGroq = async (systemPrompt, userPrompt, temperature = 0.7) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
    max_tokens: 2048,
  });

  return response.choices[0].message.content;
};

const callGroqWithHistory = async (systemPrompt, messages, temperature = 0.8) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature,
    max_tokens: 1024,
  });

  return response.choices[0].message.content;
};

module.exports = { callGroq, callGroqWithHistory };