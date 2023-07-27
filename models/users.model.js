const { query } = require('express');
const { pool } = require('./db');

const users = {
  create: (data, callback) => {
    pool.query(
      `INSERT INTO user(email, username, password, provider_id, provider, admin)
              VALUES(?,?,?,?,?,?)`,
      [data.email, data.username, data.password, data.provider_id, data.provider, data.admin],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },
  getMultiple: (callback) => {
    pool.query(`SELECT * FROM user`, [], (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results);
    });
  },
  getById: (params, callback) => {
    pool.query(`SELECT * FROM user WHERE id = ?`, [params.id], (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results);
    });
  },
  getByEmail: (data, callback) => {
    pool.query(`SELECT * from user WHERE email = ?`, [data.email], (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results);
    });
  },
  getByUsername: (data, callback) => {
    pool.query(
      `SELECT * from user WHERE username = ?`,
      [data.username],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },
  update: (data, params, callback) => {
    pool.query(
      `UPDATE user SET email=?, phone=?, fullname=?, username=?, password=?, avatar=? WHERE id=?`,
      [data.email, data.phone, data.fullname, data.username, data.password, data.avatar, params.id],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },
  updataPassword: (data, params, callback) => {
    pool.query(
      `UPDATE user SET password=? WHERE id=?`,
      [data.password, params.id],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },
  delete: (params, callback) => {
    pool.query(`DELETE FROM user WHERE id = ?`, [params.id], (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results);
    });
  },
  checkExistsByEmail: (data, callback) => {
    pool.query(
      `SELECT EXISTS(SELECT id FROM user WHERE user.email = ?) AS output`,
      [data.email],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },
  checkExistsByUsername: (data, callback) => {
    pool.query(
      `SELECT EXISTS(SELECT id FROM user WHERE user.username = ?) AS output`,
      [data.username],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },
};

module.exports = users;
