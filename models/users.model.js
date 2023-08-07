const { pool } = require('./db');
const { getOffset, createFilterQuery } = require('../helper');
const config = require('../config');

const users = {
  create: async (data) => {
    try {
      const [rows, fields] = await pool.query(
        `INSERT INTO user(id, email, verified_email, username, password, phone, admin, created_at, updated_at)
          VALUES(?,?,?,?,?,?,?,?,?)`,
        [
          data.id,
          data.email,
          data.verified_email,
          data.username,
          data.password,
          data.phone,
          data.admin,
          data.created_at,
          data.updated_at,
        ]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
  createWithoutAdmin: async (data) => {
    try {
      const [rows, fields] = await pool.query(
        `INSERT INTO user(id, email, username, password, phone, provider, provider_id, created_at, updated_at)
          VALUES(?,?,?,?,?,?,?,?,?)`,
        [
          data.id,
          data.email,
          data.username,
          data.password,
          data.phone,
          data.provider,
          data.provider_id,
          data.created_at,
          data.updated_at,
        ]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
  getMultiple: async (query) => {
    try {
      const { page, limit = config.limit, ...filter } = query;
      const filterQuery = createFilterQuery(filter, 'user');

      if (page) {
        const offset = getOffset(page, Number(limit));

        const dataQuery = `SELECT * FROM user ${filterQuery} LIMIT ? OFFSET ?`;
        const dataValues = [Number(limit), offset];
        const [rows, fields] = await pool.query(dataQuery, dataValues);

        const countQuery = `SELECT COUNT(user.id) AS totalRows FROM user ${filterQuery}`;
        const [countRows, countFields] = await pool.query(countQuery);
        const totalRows = countRows[0].totalRows;
        const totalPages = Math.ceil(totalRows / limit);

        return {
          data: rows,
          pagination: {
            page: Number(page),
            limit,
            totalRows,
            totalPages,
          },
        };
      } else {
        const dataQuery = `SELECT * FROM user ${filterQuery}`;
        const [rows, fields] = await pool.query(dataQuery);
        return rows;
      }
    } catch (error) {
      throw error;
    }
  },
  getById: async (params) => {
    try {
      const [rows, fields] = await pool.query(`SELECT * FROM user WHERE id = ?`, [params.id]);
      return rows;
    } catch (error) {
      throw error;
    }
  },
  getByEmail: async (data) => {
    try {
      const [rows, fields] = await pool.query(`SELECT * FROM user WHERE email = ?`, [data.email]);
      return rows;
    } catch (error) {
      throw error;
    }
  },
  getByUsername: async (data) => {
    try {
      const [rows, fields] = await pool.query(`SELECT * FROM user WHERE username = ?`, [
        data.username,
      ]);
      return rows;
    } catch (error) {
      throw error;
    }
  },
  update: async (data, params) => {
    try {
      let updateFields = [];
      let updateValues = [];

      if (data.email !== undefined) {
        updateFields.push('email=?');
        updateValues.push(data.email);
      }
      if (data.phone !== undefined) {
        updateFields.push('phone=?');
        updateValues.push(data.phone);
      }
      if (data.fullname !== undefined) {
        updateFields.push('fullname=?');
        updateValues.push(data.fullname);
      }
      if (data.username !== undefined) {
        updateFields.push('username=?');
        updateValues.push(data.username);
      }
      if (data.password !== undefined) {
        updateFields.push('password=?');
        updateValues.push(data.password);
      }
      if (data.updated_at !== undefined) {
        updateFields.push('updated_at=?');
        updateValues.push(data.updated_at);
      }
      if (data.avatar !== undefined) {
        updateFields.push('avatar=?');
        updateValues.push(data.avatar);
      }
      if (data.verified_email !== undefined) {
        updateFields.push('verified_email=?');
        updateValues.push(data.verified_email);
      }
      if (data.admin !== undefined) {
        updateFields.push('admin=?');
        updateValues.push(data.admin);
      }

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE user SET ${updateFields.join(', ')} WHERE id=?`;
        const values = [...updateValues, params.id];

        const [rows, fields] = await pool.query(updateQuery, values);
        return rows;
      } else {
        return { affectedRows: 0 };
      }
    } catch (error) {
      throw error;
    }
  },
  updateByEmail: async (data, params) => {
    try {
      let updateFields = [];
      let updateValues = [];

      if (data.email !== undefined) {
        updateFields.push('email=?');
        updateValues.push(data.email);
      }
      if (data.phone !== undefined) {
        updateFields.push('phone=?');
        updateValues.push(data.phone);
      }
      if (data.fullname !== undefined) {
        updateFields.push('fullname=?');
        updateValues.push(data.fullname);
      }
      if (data.username !== undefined) {
        updateFields.push('username=?');
        updateValues.push(data.username);
      }
      if (data.password !== undefined) {
        updateFields.push('password=?');
        updateValues.push(data.password);
      }
      if (data.updated_at !== undefined) {
        updateFields.push('updated_at=?');
        updateValues.push(data.updated_at);
      }
      if (data.avatar !== undefined) {
        updateFields.push('avatar=?');
        updateValues.push(data.avatar);
      }
      if (data.verified_email !== undefined) {
        updateFields.push('verified_email=?');
        updateValues.push(data.verified_email);
      }
      if (data.admin !== undefined) {
        updateFields.push('admin=?');
        updateValues.push(data.admin);
      }

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE user SET ${updateFields.join(', ')} WHERE email=?`;
        const values = [...updateValues, params.email];

        const [rows, fields] = await pool.query(updateQuery, values);
        return rows;
      } else {
        return { affectedRows: 0 };
      }
    } catch (error) {
      throw error;
    }
  },
  delete: async (params) => {
    try {
      const results = await pool.query(`DELETE FROM user WHERE id = ?`, [params.id]);
      return results;
    } catch (error) {
      throw error;
    }
  },
  checkExistsByEmail: async (data) => {
    try {
      const queryString = `SELECT EXISTS(SELECT id FROM user WHERE user.email = ?) AS output`;
      const [rows, fields] = await pool.query(queryString, [data.email]);
      const exists = rows[0].output === 1;
      return exists;
    } catch (error) {
      throw error;
    }
  },
  checkExistsByUsername: async (data) => {
    try {
      const queryString = `SELECT EXISTS(SELECT id FROM user WHERE user.username = ?) AS output`;
      const [rows, fields] = await pool.query(queryString, [data.username]);
      const exists = rows[0].output === 1;
      return exists;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = users;
