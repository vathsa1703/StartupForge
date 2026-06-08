const express = require('express');
const router = express.Router();
const { createStartup, getStartup, getAllStartups } = require('../controllers/startup.controller');

router.post('/create', createStartup);
router.get('/', getAllStartups);
router.get('/:id', getStartup);

module.exports = router;