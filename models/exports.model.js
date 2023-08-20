const { pool } = require('./db');

const _exports = {
  getProductsPerPatch: async (batchSize, offset) => {
    try {
      const [rows, fields] = await pool.query(
        `
        SELECT * FROM product
        LIMIT ? OFFSET ?
      `,
        [batchSize, offset]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = _exports;
