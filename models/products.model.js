const { pool } = require('./db');
const { getOffset, createFilterQuery } = require('../helper');
const config = require('../config');

const products = {
  create: async (data) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows, fields] = await connection.query(
        `INSERT INTO product(id, name, slug, price, discount, unit, short_desc, feature, brand_id,
                category_id, quantity, warranty, thumbnail, new, featured, bestseller, freeship,
                hidden, start_at, end_at, created_at, updated_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          data.id,
          data.name,
          data.slug,
          data.price,
          data.discount,
          data.unit,
          data.short_desc,
          data.feature,
          data.brand_id,
          data.category_id,
          data.quantity,
          data.warranty,
          data.thumbnail,
          data.new,
          data.featured,
          data.bestseller,
          data.freeship,
          data.hidden,
          data.start_at,
          data.end_at,
          data.created_at,
          data.updated_at,
        ]
      );
      if (data.specification) {
        for (const item of data.specification) {
          await connection.query(
            `INSERT INTO specification(product_id, name, value)
              VALUES(?,?,?)`,
            [data.id, item.name, item.value]
          );
        }
      }
      if (data.product_image) {
        for (const item of data.product_image) {
          await connection.query(
            `INSERT INTO product_image(product_id, url, on_top)
              VALUES(?,?,?)`,
            [data.id, item.url, item.on_top]
          );
        }
      }
      await connection.commit();
      return rows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  getMultiple: async (query) => {
    try {
      const { page, limit = config.limit, ...filter } = query;
      const filterQuery = createFilterQuery(filter, 'product');

      if (page) {
        const offset = getOffset(page, Number(limit));

        const dataQuery = `
          WITH filtered_product AS (
            SELECT * FROM product
            ${filterQuery}
          )
          SELECT
            filtered_product.id, filtered_product.name, filtered_product.slug, filtered_product.price, 
            filtered_product.discount, filtered_product.unit, filtered_product.quantity, 
            filtered_product.warranty, filtered_product.thumbnail, filtered_product.created_at, 
            filtered_product.updated_at,
            category.name AS category_name,
            brand.name AS brand_name
          FROM filtered_product
            JOIN category ON filtered_product.category_id = category.id
            LEFT JOIN brand ON filtered_product.brand_id = brand.id
          LIMIT ? OFFSET ?
        `;

        const dataValues = [Number(limit), offset];
        const [rows, fields] = await pool.query(dataQuery, dataValues);

        const countQuery = `
          SELECT COUNT(product.id) AS totalRows
          FROM product
          ${filterQuery}
        `;
        const [countRows, countFields] = await pool.query(countQuery);
        const totalRows = countRows[0].totalRows;
        const totalPages = Math.ceil(totalRows / limit);

        return {
          data: rows,
          pagination: {
            page,
            limit,
            totalRows,
            totalPages,
          },
        };
      } else {
        const dataQuery = `
          WITH filtered_product AS (
            SELECT * FROM product
            ${filterQuery}
          )
          SELECT
            filtered_product.id, filtered_product.name, filtered_product.slug, filtered_product.price, 
            filtered_product.discount, filtered_product.unit, filtered_product.quantity, 
            filtered_product.warranty, filtered_product.thumbnail, filtered_product.created_at, 
            filtered_product.updated_at,
            category.name AS category_name,
            brand.name AS brand_name
          FROM filtered_product
            JOIN category ON filtered_product.category_id = category.id
            LEFT JOIN brand ON filtered_product.brand_id = brand.id
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
      const [specificationRows, specificationFields] = await pool.query(
        `
          SELECT name, value 
          FROM specification WHERE product_id = ?
        `,
        [params.id]
      );

      const [imageRows, imagefields] = await pool.query(
        `
          SELECT url, on_top 
          FROM product_image WHERE product_id = ?
        `,
        [params.id]
      );

      const queryString = `
        WITH selected_product AS (
          SELECT * FROM product
          WHERE product.id = ?
        )
        SELECT
        selected_product.*,
        category.name AS category_name,
        brand.name AS brand_name
        FROM selected_product
          JOIN category ON selected_product.category_id = category.id
          LEFT JOIN brand ON selected_product.brand_id = brand.id
      `;
      const [rows, fields] = await pool.query(queryString, [params.id]);
      rows[0].specification = specificationRows;
      rows[0].product_image = imageRows;
      return rows;
    } catch (error) {
      throw error;
    }
  },
  update: async (data, params) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

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
      if (data.price !== undefined) {
        updateFields.push('price=?');
        updateValues.push(data.price);
      }
      if (data.discount !== undefined) {
        updateFields.push('discount=?');
        updateValues.push(data.discount);
      }
      if (data.unit !== undefined) {
        updateFields.push('unit=?');
        updateValues.push(data.unit);
      }
      if (data.short_desc !== undefined) {
        updateFields.push('short_desc=?');
        updateValues.push(data.short_desc);
      }
      if (data.feature !== undefined) {
        updateFields.push('feature=?');
        updateValues.push(data.feature);
      }
      if (data.brand_id !== undefined) {
        updateFields.push('brand_id=?');
        updateValues.push(data.brand_id);
      }
      if (data.category_id !== undefined) {
        updateFields.push('category_id=?');
        updateValues.push(data.category_id);
      }
      if (data.quantity !== undefined) {
        updateFields.push('quantity=?');
        updateValues.push(data.quantity);
      }
      if (data.warranty !== undefined) {
        updateFields.push('warranty=?');
        updateValues.push(data.warranty);
      }
      if (data.thumbnail !== undefined) {
        updateFields.push('thumbnail=?');
        updateValues.push(data.thumbnail);
      }
      if (data.new !== undefined) {
        updateFields.push('new=?');
        updateValues.push(data.new);
      }
      if (data.featured !== undefined) {
        updateFields.push('featured=?');
        updateValues.push(data.featured);
      }
      if (data.bestseller !== undefined) {
        updateFields.push('bestseller=?');
        updateValues.push(data.bestseller);
      }
      if (data.freeship !== undefined) {
        updateFields.push('freeship=?');
        updateValues.push(data.freeship);
      }
      if (data.hidden !== undefined) {
        updateFields.push('hidden=?');
        updateValues.push(data.hidden);
      }
      if (data.start_at !== undefined) {
        updateFields.push('start_at=?');
        updateValues.push(data.start_at);
      }
      if (data.end_at !== undefined) {
        updateFields.push('end_at=?');
        updateValues.push(data.end_at);
      }
      if (data.updated_at !== undefined) {
        updateFields.push('updated_at=?');
        updateValues.push(data.updated_at);
      }

      let results = {};

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE product SET ${updateFields.join(', ')} WHERE id=?`;
        const values = [...updateValues, params.id];
        const { rows, fields } = await pool.query(updateQuery, values);
        results = { ...rows };
      }

      if (data.specification) {
        const specificationList = await connection.query(
          `
          SELECT * FROM specification WHERE product.id = ?
        `,
          [params.id]
        );
        for (const item of specificationList) {
          await connection.query(`DELETE FROM specification WHERE id = ?`, [item.id]);
        }
        for (const item of data.specification) {
          await connection.query(
            `INSERT INTO specification(product_id, name, value)
              VALUES(?,?,?)`,
            [data.id, item.name, item.value]
          );
        }
      }
      if (data.product_image) {
        const productImageList = await connection.query(
          `
          SELECT * FROM product_image WHERE product.id = ?
        `,
          [params.id]
        );
        for (const item of productImageList) {
          await connection.query(`DELETE FROM product_image WHERE id = ?`, [item.id]);
        }
        for (const item of data.product_image) {
          await connection.query(`INSERT product_image`, [data.id, item.url, item.on_top]);
        }
      }
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  delete: async (params) => {
    try {
      const results = await pool.query(`DELETE FROM product WHERE id = ?`, [params.id]);
      return results;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = products;
