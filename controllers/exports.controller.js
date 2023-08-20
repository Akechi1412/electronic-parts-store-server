require('dotenv').config();
const xlsx = require('xlsx');
const exportsModel = require('../models/exports.model');

const exportProducts = async (req, res) => {
  try {
    const productList = [];
    const batchSize = 1000;
    let offset = 0;
    let i = 0; // just for testing

    while (true) {
      const results = await exportsModel.getProductsPerPatch(batchSize, offset);
      if (results.length === 0) break;
      productList.push(...results);
      console.log('Pushed batch', ++i);
      offset += batchSize;
    }

    const worksheet = xlsx.utils.json_to_sheet(productList);
    console.log('JSON done');
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'products');
    console.log('Workbook done');
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.status(200).send(buffer);
    console.log('Export done!');
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error?.message || 'some thing was wrong',
    });
  }
};

module.exports = { exportProducts };
