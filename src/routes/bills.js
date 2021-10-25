const express = require('express');
const router = express.Router();
const joi = require('joi');
const bcrypt = require('bcrypt');
const { joiValidator, renderMessage } = require('../utils/misc');
const { verifyToken } = require('../utils/middleware');
const { sqlConnect, sqlConnectMulti } = require('../utils/db');

const newBillJoiSchema = joi.object({
    group_id: joi.number().min(1).required(),
    amount: joi.number().min(0.01).required(),
    description: joi.string().min(5).max(100).required(),
});

router.get('/:id?', verifyToken, (req, res) => {
    const groupId = Number(req.params.id);
    if (isNaN(groupId) || groupId < 1) return res.redirect('/accounts');

    sqlConnect(
        'query',
        `SELECT *
        FROM bills
        WHERE group_id = ?`,
        [groupId]
    )
        .then(([bills]) => {
            res.render('pages/bills', {
                pageTitle: 'Bills',
                bills: bills || [],
                groupId,
            });
        })
        .catch((err) => {
            console.log(err);
            renderMessage(res, 'Internal Error', 'Try again later', 500);
        });
});

router.post('/', verifyToken, async (req, res) => {
    const [validatedData, validatorError] = await joiValidator(
        newBillJoiSchema,
        req.body
    );

    if (validatorError) {
        res.redirect(
            `/bills/${validatedData.group_id}?error=${encodeURIComponent(
                validatorError
            )}`
        );
    } else {
        sqlConnect(
            'execute',
            `INSERT INTO bills (group_id, amount, description) VALUES (?, ?, ?)`,
            [
                validatedData.group_id,
                validatedData.amount,
                validatedData.description,
            ]
        )
            .then(([added]) => {
                if (!added?.affectedRows) {
                    res.redirect(
                        `/bills/${
                            validatedData.group_id
                        }?error=${encodeURIComponent('Bill failed to add')}`
                    );
                } else {
                    res.redirect(`/bills/${validatedData.group_id}?added=1`);
                }
            })
            .catch((err) => {
                console.log(err)
                res.redirect(
                    `/bills/${
                        validatedData.group_id
                    }?error=${encodeURIComponent('Internal Error')}`
                );
            });
    }
});

module.exports = router;
