// const { sendUserError } = require('./misc');
const jwt = require('jsonwebtoken');

const validateJwt = async (req, res, next) => {
	const token = req.get('authorization')?.split(' ')?.[1];
	// if(!token) return sendNotAuthorized res, "Not authorized");
	if (!token) throw new Error('sfdhgasd jgasidosjso iasdg'); //TODO: fix

	jwt.verify(token, process.env.JWT_SECRET, (err, jwtData) => {
		if (err || !jwtData.id) return sendNotAuthorized(res, 'Invalid token');
		req.jwtData = jwtData;
		next();
	});
};


module.exports = {
	validateJwt
};
