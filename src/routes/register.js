const express = require('express');
const router = express.Router();
const joi = require('joi');
const bcrypt = require('bcrypt');
const { joiValidator } = require('../utils/misc');

const newUserJoiSchema = joi.object({
	fullname: joi
		.string()
		.min(3)
		.pattern(/[a-zA-Z0-9]+ [a-zA-Z0-9]+/)
		.required(),
	email: joi.string().min(4).email().required(),
	password: joi.string().min(4).max(51).required(),
	password2: joi.ref('password'),
});

router.get('/', (req, res) => {
	res.render('pages/register');
});

router.post('/', async (req, res) => {
	const [validatedData, validatorError] = await joiValidator(
		newUserJoiSchema,
		req.body
	);

	const hashedPassword = await bcrypt.hash(validatedData.password, 10);

	if (validatorError)
		return res.redirect(`/register?error=${encodeURI(validatorError)}`);

	res.redirect(`/register?error=${hashedPassword}`);
});

module.exports = router;
