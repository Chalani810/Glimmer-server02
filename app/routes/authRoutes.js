const express = require("express");
const { register,login } = require('../controllers/auth_controller');
const User = require("../models/User");

const router = express.Router();

router.post('/register', register);
router.post('/login',login);


module.exports = router
