require('dotenv').config();
const xlsx = require('xlsx');
const importsModel = require('../models/imports.model');
const fs = require('fs');
const { promisify } = require('util');

async function readExcelFileAsync(filePath) {
  const readFileAsync = promisify(fs.readFile);
  try {
    const bufferData = await readFileAsync(filePath);
    const workbook = xlsx.read(bufferData, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  } catch (error) {
    throw error;
  }
}

const insertProducts = async (req, res) => {
  const filePath = req.file.path;

  try {
    const sheetData = await readExcelFileAsync(filePath);

    console.log('Done read excel file');
    const batchSize = 10000;

    if (sheetData[0].name == undefined) {
      return res.status(404).json({
        success: 0,
        message: 'name column not found',
      });
    }

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

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully.');
      }
    });

    return res.status(500).json({
      success: 0,
      message: error?.message || 'somthing was wrong',
    });
  }
};

module.exports = { insertProducts };
