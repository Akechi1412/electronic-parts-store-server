const mysql = require('mysql');
const { db } = require('../config');

const pool = mysql.createPool(db);

module.exports = { pool };
