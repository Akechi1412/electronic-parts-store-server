const { pool } = require('./db');
const config = require('../config');
const { toSlug } = require('../helper');
const { customAlphabet } = require('nanoid/async');

async function getValidCategoryIdList(connection) {
  try {
    const [rows, fields] = await connection.query(`
      SELECT id
      FROM category
      WHERE id NOT IN (
        SELECT parent_id 
        FROM category 
        WHERE parent_id IS NOT NULL 
        GROUP BY parent_id
      )
    `);

    if (rows.length === 0) {
      throw new Error('can not add any products as no category has been added yet');
    }

    return rows.map((item) => item.id);
  } catch (error) {
    throw error;
  }
}

async function getValidBrandIdList(connection) {
  try {
    const [rows, fields] = await connection.query(`
      SELECT id FROM brand
    `);
    return rows?.map((item) => item.id) || [];
  } catch (error) {
    throw error;
  }
}

const imports = {
  insertProducts: async (dataList, batchSize) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const validBrandIdList = await getValidBrandIdList(connection);
      const validCategoryIdList = await getValidCategoryIdList(connection);
      const defaultCategoryId = validCategoryIdList[0];
      const totalRows = dataList.length;
      let rowIndex = 1;
      let i = 0; // just for testing
      const nanoid = customAlphabet(config.idAlphabet, config.idLength);
      const batchPromises = [];

      for (let startIndex = 0; startIndex < totalRows; startIndex += batchSize) {
        const endIndex = Math.min(startIndex + batchSize, totalRows);
        const batchData = dataList.slice(startIndex, endIndex);

        const query = `
          INSERT INTO product(id, name, slug, short_desc, quantity, unit, warranty, price, 
            category_id, brand_id, feature, hidden, new, featured, bestseller, freeship,
            created_at, updated_at) 
            VALUES ?
        `;

        const valuesPromise = batchData.map(async (item) => {
          rowIndex++;
          if (!item.name?.trim()) {
            throw new Error(`name is empty at row ${rowIndex}`);
          }

          if (item.category_id && !validCategoryIdList.includes(item.category_id)) {
            throw new Error(
              `category id is invalid because it does not exist or contains a subcategory at row ${rowIndex}`
            );
          }

          if (item.brand_id && !validBrandIdList.includes(item.brand_id)) {
            throw new Error(`brand id is invalid at row ${rowIndex}`);
          }

          if (item.price && isNaN(Number(item.price))) {
            throw new Error(`price is not a number at row ${rowIndex}`);
          }

          if (item.warranty && isNaN(Number(item.warranty))) {
            throw new Error(`warranty is not a number at row ${rowIndex}`);
          }

          if (item.quantity && isNaN(Number(item.quantity))) {
            throw new Error(`quantity is not a number at row ${rowIndex}`);
          }

          const id = BigInt(await nanoid());
          const slug = toSlug(item.name) + '-' + id;
          const mysqlTimestamp = new Date();
          const created_at = mysqlTimestamp;
          const updated_at = mysqlTimestamp;

          return [
            id,
            item.name,
            slug,
            item.short_desc,
            item.quantity,
            item.unit,
            item.warranty || 0,
            item.price,
            item.category_id || defaultCategoryId,
            item.brand_id,
            item.feature,
            item.hidden ? 1 : 0,
            item.new ? 1 : 0,
            item.featured ? 1 : 0,
            item.bestseller ? 1 : 0,
            item.freeship ? 1 : 0,
            created_at,
            updated_at,
          ];
        });

        const values = await Promise.all(valuesPromise);

        batchPromises.push(connection.query(query, [values]));
        console.log('pushed batch:', ++i);
      }

      await Promise.all(batchPromises);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};
module.exports = imports;
