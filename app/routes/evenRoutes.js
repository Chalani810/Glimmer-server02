const express = require("express");
const { add } = require('../controllers/event_controller');
const authMiddleware = require("../middleware/authMiddleware")
const Event = require("../models/Event");

const router = express.Router();

router.post('/add',authMiddleware, add);

module.exports = router