/**
 * @param {{}} joiSchema joi object schema
 * @param {{}} body request body
 * @returns {Promise<[data: {} | null, error: string | null]>} [Validated Data, Error String]
 */
const joiValidator = async (joiSchema, body) => {
    if (!joiSchema || !body) return Promise.resolve([null, 'Fields Missing']);
    return joiSchema
        .validateAsync(body)
        .then((res) => [res, null])
        .catch((err) => [null, err.message.replace(/"/g, '')]);
};

const renderMessage = (res, heading = '', message = '', statusCode = 200) => {
    res.status(statusCode).render('pages/message', [heading, message]);
};

module.exports = {
    joiValidator,
    renderMessage,
};
