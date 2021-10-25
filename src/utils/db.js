const mysql = require('mysql2/promise');

const connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};

/**
 * @param {string} command - query OR execute
 * @param {string} sql - Query
 * @param {(string | number)[]} data - Data array
 * @returns {Promise<[]>}
 */
const sqlConnect = (command = 'query', sql = '', data = []) =>
    new Promise(async (resolve, reject) => {
        try {
            const connection = await mysql.createConnection(connectionConfig);
            await connection[command](sql, data).then(resolve).catch(reject);
            await connection.end();
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });

/**
 * @param {(connection: mysql.Connection) => Promise<void>} asyncCallback
 * @returns {Promise<void>}
 */
const sqlConnectMulti = (asyncCallback) =>
    new Promise(async (resolve, reject) => {
        try {
            const connection = await mysql.createConnection(connectionConfig);
            await asyncCallback(connection).then(resolve).catch(reject);
            await connection.end();
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });

module.exports = {
    sqlConnect,
    sqlConnectMulti,
};
