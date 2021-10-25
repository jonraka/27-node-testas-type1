const express = require('express');
const router = express.Router();
const joi = require('joi');
const bcrypt = require('bcrypt');
const { joiValidator } = require('../utils/misc');
const { nanoid } = require('nanoid');
const { sqlConnect, sqlConnectMulti } = require('../utils/db');

const accessTokenExpiresInMinutes = 1;

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

    if (validatorError)
        return res.redirect(`/login?error=${encodeURI(validatorError)}`);

    sqlConnectMulti(async (connection) => {
        const [data] = await connection.execute(
            'SELECT *, CURRENT_TIMESTAMP - access_token_timestamp AS token_creation_difference  FROM users WHERE email = ?',
            [validatedData.email]
        );

        if (!data?.length)
            return res.redirect(`/login?error=${encodeURI('User Not Found')}`);

        const passwordMatched = bcrypt.compareSync(
            validatedData.password,
            data[0].password
        );

        if (!passwordMatched)
            res.redirect(`/login?error=${encodeURI('Password invalid')}`);

        if (
            !data[0].access_token ||
            isNaN(data[0].token_creation_difference) ||
            Number(data[0].token_creation_difference) >
                60 * accessTokenExpiresInMinutes
        ) {
            const newAccessToken = nanoid(40);

            const [didUpdate] = await connection.execute(
                'UPDATE users SET access_token = ?, access_token_timestamp = CURRENT_TIMESTAMP WHERE email = ? LIMIT 1',
                [newAccessToken, validatedData.email]
            );

            if (didUpdate.affectedRows > 0) {
                console.log('new');
                data[0].access_token = newAccessToken;
            } else {
                return res.redirect(
                    `/login?error=${encodeURI('Internal Error')}`
                );
            }
        }

        res.render('pages/savetoken', {
            accessToken: data?.[0]?.access_token,
        });
    }).catch((err) => {
        console.log(err);
        res.redirect(`/login?error=${encodeURI('Internal Error')}`);
    });
});

module.exports = router;
