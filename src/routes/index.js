const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.redirect('/accounts'));
router.use('/accounts', require('./accounts'));
router.use('/bills', require('./bills'));
router.use('/register', require('./register'));
router.use('/login', require('./login'));

module.exports = router;
