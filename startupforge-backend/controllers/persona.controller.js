const Startup = require('../models/Startup.model');
const ChatSession = require('../models/ChatSession.model');
const { chatWithPersona } = require('../services/persona.service');

const chat = async (req, res, next) => {
  try {
    const { startupId, personaId, message } = req.body;

    const startup = await Startup.findById(startupId);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

    const persona = startup.personas.id(personaId);
    if (!persona) return res.status(404).json({ success: false, message: 'Persona not found' });

    let session = await ChatSession.findOne({ startupId, personaId });
    if (!session) {
      session = await ChatSession.create({ startupId, personaId, messages: [] });
    }

    session.messages.push({ role: 'user', content: message });

    const history = session.messages.map(m => ({ role: m.role, content: m.content }));
    const reply = await chatWithPersona(persona, startup, history);

    session.messages.push({ role: 'assistant', content: reply });
    await session.save();

    res.json({ success: true, data: { reply, messages: session.messages } });
  } catch (err) {
    next(err);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const { startupId, personaId } = req.params;
    const session = await ChatSession.findOne({ startupId, personaId });
    res.json({ success: true, data: session?.messages || [] });
  } catch (err) {
    next(err);
  }
};

module.exports = { chat, getChatHistory };