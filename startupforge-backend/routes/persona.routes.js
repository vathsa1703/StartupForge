const express = require('express');
const router = express.Router();
const { chat, getChatHistory } = require('../controllers/persona.controller');

router.post('/chat', chat);
router.get('/history/:startupId/:personaId', getChatHistory);

module.exports = router;