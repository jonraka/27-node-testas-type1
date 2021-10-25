const express = require('express');
const router = express.Router();
const joi = require('joi');
const bcrypt = require('bcrypt');
const { joiValidator } = require('../utils/misc');
const { sqlConnect } = require('../utils/db');

const newUserJoiSchema = joi.object({
    fullname: joi
        .string()
        .min(3)
        .pattern(/[a-zA-Z]+ [a-zA-Z ]+/)
        .required(),
    email: joi.string().min(4).email().required(),
    password: joi.string().min(4).max(51).required(),
    password2: joi.ref('password'),
});

router.get('/', (req, res) => {
    res.render('pages/register', {
        pageTitle: 'Register',
    });
});

router.post('/', async (req, res) => {
    const [validatedData, validatorError] = await joiValidator(
        newUserJoiSchema,
        req.body
    );

    if (validatorError)
        return res.redirect(`/register?error=${encodeURIComponent(validatorError)}`);

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    sqlConnect(
        'execute',
        `
        INSERT INTO users (full_name, email, password)
        VALUES (?, ?, ?)
    `,
        [validatedData.fullname, validatedData.email, hashedPassword]
    )
        .then(([data]) => {
            if (data.affectedRows > 0) {
                res.redirect('/login?registered=1');
            } else {
                res.redirect(`/register?error=${encodeURIComponent('Internal Error')}`);
            }
        })
        .catch((err) => {
            if (err.errno === 1062)
                return res.redirect(
                    `/register?error=${encodeURIComponent('User already exists')}`
                );

            res.redirect(`/register?error=${encodeURIComponent('Internal Error')}`);
        });
});

module.exports = router;
