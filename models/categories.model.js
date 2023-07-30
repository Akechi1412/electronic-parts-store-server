const { pool } = require('./db');
const { promisify } = require('util');
const { getOffset } = require('../helper');
const config = require('../config');

const queryAsync = promisify(pool.query).bind(pool);

const categories = {
  create: async (data) => {
    try {
      const results = await queryAsync(
        `INSERT INTO category(parent_id, name, slug, thumbnail, created_at, updated_at)
          VALUES(?,?,?,?,?,?)`,
        [data.parent_id, data.name, data.slug, data.thumbnail, data.created_at, data.updated_at]
      );
      return results;
    } catch (error) {
      throw error;
    }
  },
  getAll: async () => {
    try {
      const results = await queryAsync(`SELECT * FROM category`);
      return results;
    } catch (error) {
      throw error;
    }
  },
  getMultiple: async () => {
    try {
      const { page = 1, limit = config.limit, ...filter } = query;

      const offset = getOffset(page, limit);

      let filterQuery = '';
      const filterKeys = Object.keys(filter);
      if (filterKeys.length > 0) {
        const conditions = filterKeys.map((key) => {
          if (key.endsWith('_like')) {
            const fieldName = key.substring(0, key.length - 5);
            return `${fieldName} LIKE '%${filter[key]}%'`;
          } else {
            return `${key}='${filter[key]}'`;
          }
        });
        filterQuery = `WHERE ${conditions.join(' AND ')}`;
      }

      const dataQuery = `SELECT * FROM category ${filterQuery} LIMIT ? OFFSET ?`;
      const dataValues = [limit, offset];
      const results = await queryAsync(dataQuery, dataValues);

      const countQuery = `SELECT COUNT(*) AS totalRows FROM category ${filterQuery}`;
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
    } catch (error) {
      throw error;
    }
  },
  getById: async (params) => {
    try {
      const results = await queryAsync(`SELECT * FROM category WHERE id = ?`, [params.id]);
      return results;
    } catch (error) {
      throw error;
    }
  },
  update: async (data, params) => {
    try {
      let updateFields = [];
      let updateValues = [];

      if (data.parent_id !== undefined) {
        updateFields.push('parent_id=?');
        updateValues.push(data.parent_id);
      }
      if (data.name !== undefined) {
        updateFields.push('name=?');
        updateValues.push(data.name);
      }
      if (data.slug !== undefined) {
        updateFields.push('slug=?');
        updateValues.push(data.slug);
      }
      if (data.thumbnail !== undefined) {
        updateFields.push('thumbnail=?');
        updateValues.push(data.thumbnail);
      }
      if (data.updated_at !== undefined) {
        updateFields.push('updated_at=?');
        updateValues.push(data.updated_at);
      }

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE category SET ${updateFields.join(', ')} WHERE id=?`;
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
  delete: async (params) => {
    try {
      const results = await queryAsync(`DELETE FROM category WHERE id = ?`, [params.id]);
      return results;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = categories;
