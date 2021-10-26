const { sqlConnect } = require('../utils/db');

const verifyToken = async (req, res, next) => {
    const token = req.cookies?.['bills_access_token'];
    if (!token) {
        return res.redirect(
            `/login?error=${encodeURIComponent('Please log in')}`
        );
    }

    sqlConnect(
        'query',
        `SELECT *, TIMESTAMPDIFF(second, CURRENT_TIMESTAMP, expires_at) AS timeDiff
        FROM access_tokens
        LEFT JOIN users
        ON users.id = access_tokens.user_id
        WHERE token = ?`,
        [token]
    )
        .then(([data]) => {
            if (!data.length || data[0].timeDiff < 0) {
                res.clearCookie('bills_access_token');
                res.redirect(
                    `/login?error=${encodeURIComponent(
                        'Session expired, please log in.'
                    )}`
                );
            } else {
                req.userData = {
                    user_id: data[0].user_id,
                    full_name: data[0].full_name,
                    email: data[0].email,
                };
                next();
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect(
                `/login?error=${encodeURIComponent('Internal Error')}`
            );
        });
};

module.exports = {
    verifyToken,
};
