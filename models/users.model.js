const { pool } = require('./db');
const { promisify } = require('util');
const { getOffset, createFilterQuery } = require('../helper');
const config = require('../config');

const queryAsync = promisify(pool.query).bind(pool);

const users = {
  create: async (data) => {
    try {
      const results = await queryAsync(
        `INSERT INTO user(email, verified_email, username, password, phone, admin, created_at, updated_at)
          VALUES(?,?,?,?,?,?,?,?)`,
        [
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
      return results;
    } catch (error) {
      throw error;
    }
  },
  createWithoutAdmin: async (data) => {
    try {
      const results = await queryAsync(
        `INSERT INTO user(emai, username, password, phone, provider, provider_id, created_at, updated_at)
          VALUES(?,?,?,?,?,?,?,?)`,
        [
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
      return results;
    } catch (error) {
      throw error;
    }
  },
  getMultiple: async (query) => {
    try {
      const { page, limit = config.limit, ...filter } = query;
      const filterQuery = createFilterQuery(filter);

      if (page) {
        const offset = getOffset(page, limit);

        const dataQuery = `SELECT * FROM user ${filterQuery} LIMIT ? OFFSET ?`;
        const dataValues = [limit, offset];
        const results = await queryAsync(dataQuery, dataValues);

        const countQuery = `SELECT COUNT(*) AS totalRows FROM user ${filterQuery}`;
        const countResult = await queryAsync(countQuery);
        const totalRows = countResult[0].totalRows;
        const totalPages = Math.ceil(totalRows / limit);

        return {
          data: results,
          pagination: {
            page,
            limit,
            totalRows,
            totalPages,
          },
        };
      } else {
        const dataQuery = `SELECT * FROM user ${filterQuery}`;
        const results = await queryAsync(dataQuery);
        return results;
      }
    } catch (error) {
      throw error;
    }
  },
  getById: async (params) => {
    try {
      const results = await queryAsync(`SELECT * FROM user WHERE id = ?`, [params.id]);
      return results;
    } catch (error) {
      throw error;
    }
  },
  getByEmail: async (data) => {
    try {
      const results = await queryAsync(`SELECT * FROM user WHERE email = ?`, [data.email]);
      return results;
    } catch (error) {
      throw error;
    }
  },
  getByUsername: async (data) => {
    try {
      const results = await queryAsync(`SELECT * FROM user WHERE username = ?`, [data.username]);
      return results;
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

        const results = await queryAsync(updateQuery, values);
        return results;
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

        const results = await queryAsync(updateQuery, values);
        return results;
      } else {
        return { affectedRows: 0 };
      }
    } catch (error) {
      throw error;
    }
  },
  delete: async (params) => {
    try {
      const results = await queryAsync(`DELETE FROM user WHERE id = ?`, [params.id]);
      return results;
    } catch (error) {
      throw error;
    }
  },
  checkExistsByEmail: async (data) => {
    try {
      const query = `SELECT EXISTS(SELECT id FROM user WHERE user.email = ?) AS output`;
      const results = await queryAsync(query, [data.email]);
      const exists = results[0].output === 1;
      return exists;
    } catch (error) {
      throw error;
    }
  },
  checkExistsByUsername: async (data) => {
    try {
      const query = `SELECT EXISTS(SELECT id FROM user WHERE user.username = ?) AS output`;
      const results = await queryAsync(query, [data.username]);
      const exists = results[0].output === 1;
      return exists;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = users;
