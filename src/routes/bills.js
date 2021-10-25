const express = require('express');
const router = express.Router();
const joi = require('joi');
const bcrypt = require('bcrypt');
const { joiValidator, renderMessage } = require('../utils/misc');
const { verifyToken } = require('../utils/middleware');
const { sqlConnect, sqlConnectMulti } = require('../utils/db');

router.get('/:id?', verifyToken, (req, res) => {
    const billId = Number(req.params.id);
    if (isNaN(billId) || billId < 1) return res.redirect('/accounts');

    sqlConnect(
        'query',
        `SELECT *
        FROM bills
        WHERE group_id = ?`, []
    )
        .then(([accounts]) => {
            res.render('pages/accounts', {
                pageTitle: 'Accounts',
                accounts: accounts || [],
            });
        })
        .catch((err) => {
            renderMessage(res, 'Internal Error', 'Try again later', 500);
        });
});

// router.post('/', async (req, res) => {

// });

module.exports = router;
