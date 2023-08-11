require('dotenv').config();
const xlsx = require('xlsx');
const importsModel = require('../models/imports.model');
const fs = require('fs');

const insertProducts = async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const batchSize = 10000;

    await importsModel.insertProducts(sheetData, batchSize);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully.');
      }
    });

    return res.status(200).json({
      success: 1,
      data: { totalRows: sheetData.length },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      error: error?.message || 'somthing was wrong',
    });
  }
};

module.exports = { insertProducts };
