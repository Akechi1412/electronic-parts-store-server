const { pool } = require('./db');
const { getOffset, createFilterQuery } = require('../helper');
const config = require('../config');

const brands = {
  create: async (data) => {
    try {
      const [rows, fields] = await pool.query(
        `INSERT INTO brand(name, slug, description, logo, created_at, updated_at)
          VALUES(?,?,?,?,?,?)`,
        [data.name, data.slug, data.description, data.logo, data.created_at, data.updated_at]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
  getMultiple: async (query) => {
    try {
      const { page, limit = config.limit, ...filter } = query;
      const filterQuery = createFilterQuery(filter, 'brand');

      if (page) {
        const offset = getOffset(page, Number(limit));

        const dataQuery = `
          SELECT * FROM brand
          ${filterQuery}
          LIMIT ? OFFSET ?
        `;
        const dataValues = [Number(limit), offset];
        const [rows, fields] = await pool.query(dataQuery, dataValues);

        const countQuery = `
          SELECT COUNT(brand.id) AS totalRows
          FROM brand
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
          SELECT * FROM brand
          ${filterQuery}
        `;

        const [rows, fields] = await pool.query(dataQuery);
        return rows;
      }
    } catch (error) {
      throw error;
    }
  },
  getById: async (params) => {
    try {
      const queryString = `
        SELECT brand.*
        FROM brand
        WHERE brand.id = ?`;
      const [rows, fields] = await pool.query(queryString, [params.id]);
      return rows;
    } catch (error) {
      throw error;
    }
  },
  checkExistsByName: async (data, params) => {
    try {
      let queryString = `SELECT EXISTS(SELECT * FROM brand WHERE brand.name = ?`;
      const values = [data.name];

      if (params?.id) {
        queryString += ' AND brand.id != ?';
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
  update: async (data, params) => {
    try {
      let updateFields = [];
      let updateValues = [];

      if (data.name !== undefined) {
        updateFields.push('name=?');
        updateValues.push(data.name);
      }
      if (data.slug !== undefined) {
        updateFields.push('slug=?');
        updateValues.push(data.slug);
      }
      if (data.logo !== undefined) {
        updateFields.push('logo=?');
        updateValues.push(data.logo);
      }
      if (data.slug !== undefined) {
        updateFields.push('slug=?');
        updateValues.push(data.slug);
      }
      if (data.description !== undefined) {
        updateFields.push('description=?');
        updateValues.push(data.description);
      }
      if (data.updated_at !== undefined) {
        updateFields.push('updated_at=?');
        updateValues.push(data.updated_at);
      }

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE brand SET ${updateFields.join(', ')} WHERE id=?`;
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
      const [rows, fields] = await pool.query(`DELETE FROM brand WHERE id = ?`, [params.id]);
      return rows;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = brands;
