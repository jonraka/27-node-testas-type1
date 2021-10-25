const express = require('express');
const router = express.Router();
const joi = require('joi');
const bcrypt = require('bcrypt');
const { joiValidator, renderMessage } = require('../utils/misc');
const { verifyToken } = require('../utils/middleware');
const { sqlConnect, sqlConnectMulti } = require('../utils/db');

router.get('/', verifyToken, (req, res) => {
    sqlConnectMulti(async (connection) => {
        const [allGroups] = await connection.execute('SELECT * FROM groups');
        const [userGroups] = await connection.execute(
            `SELECT group_id, user_id, name
            FROM accounts
            LEFT JOIN groups
            ON groups.id = accounts.group_id
            WHERE accounts.user_id = ?
            ORDER BY group_id asc`,
            [req.userData.user_id]
        );

        console.log(userGroups)

        res.render('pages/accounts', {
            pageTitle: 'Groups',
            allGroups: allGroups || [],
            userGroups: userGroups || [],
            ownedGroupIds: userGroups.map(account => account.group_id) || [],
        });
    }).catch((err) => {
        console.log(err);
        renderMessage(res, 'Internal Error', 'Try again later', 500);
    });
});

router.post('/', verifyToken, async (req, res) => {
    const groupId = Number(req.body.group_id);
    if (isNaN(groupId) || groupId < 1) return res.redirect('/accounts');

    await sqlConnect(
        'execute',
        `INSERT INTO accounts (group_id, user_id) VALUES (?, ?)`,
        [groupId, req.userData.user_id]
    )
        .then(([insertedData]) => {
            if (insertedData.affectedRows === 0) {
                console.log('failed to add an account');
            } else {
                console.log('account added');
            }
        })
        .catch((err) => {
            console.log(err);
        });

    res.redirect('/accounts');
});

module.exports = router;
