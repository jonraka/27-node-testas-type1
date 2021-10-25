const express = require('express');
const router = express.Router();
const joi = require('joi');
const bcrypt = require('bcrypt');
const { joiValidator } = require('../utils/misc');
const { verifyToken } = require('../utils/middleware');
const { sqlConnect, sqlConnectMulti } = require('../utils/db');

router.get('/', verifyToken, (req, res) => {
    res.render('pages/groups', {
        pageTitle: 'Groups',
    });
});

// router.post('/', async (req, res) => {

// });

module.exports = router;
