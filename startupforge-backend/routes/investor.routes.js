const express = require('express')
const { chat,getChatHistory } = require('../controllers/investor.controller')


const router = express.Router()
router.get(
  '/history/:startupId/:investorId',
  getChatHistory
)

router.post('/chat', chat)

module.exports = router