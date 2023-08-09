require('dotenv').config();
const xlsx = require('xlsx');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const insertProducts = async (req, res) => {
  try {
    return res.status(200).json({
      success: 1,
      data: '...',
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

module.exports = { insertProducts };
