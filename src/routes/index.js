const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.redirect('/groups'));
router.use('/groups', require('./groups'));
router.use('/register', require('./register'));
router.use('/login', require('./login'));

module.exports = router;
