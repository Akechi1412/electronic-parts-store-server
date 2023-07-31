const { pool } = require('./db');
const { promisify } = require('util');
const { getOffset, createFilterQuery } = require('../helper');
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
  getMultiple: async (query) => {
    try {
      const { page, limit = config.limit, ...filter } = query;
      const filterQuery = createFilterQuery(filter);

      if (page) {
        const offset = getOffset(page, limit);

        const dataQuery = `
          SELECT
            category.*,
            parent_category.name AS parent_name
          FROM category
          LEFT JOIN category AS parent_category ON category.parent_id = parent_category.id
          ${filterQuery}
          LIMIT ? OFFSET ?
        `;

        const dataValues = [limit, offset];
        const results = await queryAsync(dataQuery, dataValues);

        const countQuery = `
          SELECT COUNT(*) AS totalRows
          FROM category
          LEFT JOIN category AS parent_category ON category.parent_id = parent_category.id
          ${filterQuery}
        `;
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
        const dataQuery = `
          SELECT
            category.*,
            parent_category.name AS parent_name
          FROM category
          LEFT JOIN category AS parent_category ON category.parent_id = parent_category.id
          ${filterQuery}
        `;

        const results = await queryAsync(dataQuery);
        return results;
      }
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
  checkExistsByName: async (data) => {
    try {
      const query = `SELECT EXISTS(SELECT id FROM category WHERE category.name = ?) AS output`;
      const results = await queryAsync(query, [data.name]);
      const exists = results[0].output === 1;
      return exists;
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
