const { pool } = require('./db');
const { getOffset, createFilterQuery } = require('../helper');
const config = require('../config');

const categories = {
  create: async (data) => {
    try {
      const [rows, fields] = await pool.query(
        `INSERT INTO category(parent_id, name, slug, thumbnail, created_at, updated_at)
          VALUES(?,?,?,?,?,?)`,
        [data.parent_id, data.name, data.slug, data.thumbnail, data.created_at, data.updated_at]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
  getMultiple: async (query) => {
    try {
      const { page, limit = config.limit, ...filter } = query;
      const filterQuery = createFilterQuery(filter, 'category');

      if (page) {
        const offset = getOffset(page, Number(limit));

        const dataQuery = `
          SELECT
            category.*,
            parent_category.name AS parent_name
          FROM category
          LEFT JOIN category AS parent_category ON category.parent_id = parent_category.id
          ${filterQuery}
          LIMIT ? OFFSET ?
        `;
        const dataValues = [Number(limit), offset];
        const [rows, fields] = await pool.query(dataQuery, dataValues);

        const countQuery = `
          SELECT COUNT(category.id) AS totalRows
          FROM category
          LEFT JOIN category AS parent_category ON category.parent_id = parent_category.id
          ${filterQuery}
        `;
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
        const dataQuery = `
          SELECT
            category.*,
            parent_category.name AS parent_name
          FROM category
          LEFT JOIN category AS parent_category ON category.parent_id = parent_category.id
          ${filterQuery}
        `;

        const [rows, fields] = await pool.query(dataQuery);
        return rows;
      }
    } catch (error) {
      throw error;
    }
  },
  getAllWithoutProducts: async () => {
    try {
      const [rows, fields] = await pool.query(`
        SELECT id, parent_id, name
        FROM category
        WHERE NOT EXISTS (
          SELECT id
          FROM product
          WHERE product.category_id = category.id
        );
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  },
  getById: async (params) => {
    try {
      const queryString = `
        SELECT category.*, parent_category.name AS parent_name
        FROM category
        LEFT JOIN category AS parent_category ON category.parent_id = parent_category.id
        WHERE category.id = ?`;
      const [rows, fields] = await pool.query(queryString, [params.id]);
      return rows;
    } catch (error) {
      throw error;
    }
  },
  checkExistsByName: async (data, params) => {
    try {
      let queryString = `SELECT EXISTS(SELECT * FROM category WHERE category.name = ?`;
      const values = [data.name];

      if (params?.id) {
        queryString += ' AND category.id != ?';
        values.push(Number(params.id));
      }

      queryString += ') AS output';

      const [rows, fields] = await pool.query(queryString, values);
      const exists = rows[0].output === 1;
      return exists;
    } catch (error) {
      throw error;
    }
  },
  checkExistsSubcategory: async (params) => {
    try {
      const queryString = `SELECT EXISTS(SELECT id FROM category WHERE category.parent_id = ?) AS output`;
      const [rows, fields] = await pool.query(queryString, [params.id]);
      const exists = rows[0].output === 1;
      return exists;
    } catch (error) {
      throw error;
    }
  },
  checkExistsProduct: async (params) => {
    try {
      const queryString = `SELECT EXISTS(SELECT id FROM product WHERE product.category_id = ?) AS output`;
      const [rows, fields] = await pool.query(queryString, [params.id]);
      const exists = rows[0].output === 1;
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
      const [rows, fields] = await pool.query(`DELETE FROM category WHERE id = ?`, [params.id]);
      return rows;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = categories;
