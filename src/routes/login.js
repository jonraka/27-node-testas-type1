const express = require('express');
const router = express.Router();
const joi = require('joi');
const bcrypt = require('bcrypt');
const { joiValidator } = require('../utils/misc');
const { nanoid } = require('nanoid');
const { sqlConnect, sqlConnectMulti } = require('../utils/db');

const tokenExpireTime = Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES) || 10;

const loginJoiSchema = joi.object({
    email: joi.string().min(4).email().required(),
    password: joi.string().min(4).max(51).required(),
});

router.get('/', (req, res) => {
    res.render('pages/login', {
        pageTitle: 'Login',
    });
});

router.post('/', async (req, res) => {
    const [validatedData, validatorError] = await joiValidator(
        loginJoiSchema,
        req.body
    );

    if (validatorError) {
        return res.redirect(
            `/login?error=${encodeURIComponent(validatorError)}`
        );
    }

    sqlConnectMulti(async (connection) => {
        const [data] = await connection.execute(
            `SELECT *
            FROM users
            WHERE email = ?`,
            [validatedData.email]
        );

        if (!data?.length) {
            return res.redirect(
                `/login?error=${encodeURIComponent('User not found')}`
            );
        }

        const passwordMatched = bcrypt.compareSync(
            validatedData.password,
            data[0].password
        );

        if (!passwordMatched) {
            return res.redirect(
                `/login?error=${encodeURIComponent('Password invalid')}`
            );
        }

        const newAccessToken = `${data[0].id}---${nanoid(40)}`;

        const [tokenInserted] = await connection.execute(
            `INSERT INTO access_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, interval ? minute))`,
            [data[0].id, newAccessToken, tokenExpireTime]
        );

        if (!tokenInserted?.affectedRows) {
            throw new Error('didUpdate.affectedRows = 0');
        }

        res.clearCookie('bills_access_token');
        res.cookie('bills_access_token', newAccessToken, {
            maxAge: tokenExpireTime * 60 * 1000,
            httpOnly: true,
        });

        res.redirect('/accounts');
    }).catch((err) => {
        console.log(err);
        res.redirect(`/login?error=${encodeURIComponent('Internal Error')}`);
    });
});

module.exports = router;
