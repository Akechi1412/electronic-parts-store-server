const { pool } = require('./db');
const config = require('../config');
const { toSlug } = require('../helper');
const { customAlphabet } = require('nanoid');

const imports = {
  insertProducts: async (dataList, batchSize) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const totalRows = dataList.length;

      for (let startIndex = 0; startIndex < totalRows; startIndex += batchSize) {
        const endIndex = Math.min(startIndex + batchSize, totalRows);
        const batchData = dataList.slice(startIndex, endIndex);

        const query = `
          INSERT INTO product(id, name, slug, short_desc, quantity, unit, warranty, price, 
            category_id, brand_id, feature, hidden, new, featured, bestseller, freeship,
            created_at, updated_at) 
            VALUES ?
        `;

        const values = batchData.map((item) => {
          if (!item.name || !item.category_id) {
            throw new Error('name or category_id is empty!');
          }

          const nanoid = customAlphabet(config.idAlphabet, config.idLength);
          const id = BigInt(nanoid());
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
            item.warranty,
            item.price,
            item.category_id,
            item.brand_id,
            item.feature,
            item.hidden,
            item.new,
            item.featured,
            item.bestseller,
            item.freeship,
            created_at,
            updated_at,
          ];
        });

        await connection.query(query, [values]);
        console.log('done 1');
      }

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
