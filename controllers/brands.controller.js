require('dotenv').config();
const { toSlug } = require('../helper');
const brandsModel = require('../models/brands.model');
const moment = require('moment');

const createBrand = async (req, res) => {
  const body = req.body;
  const mysqlTimestamp = new Date();
  body.created_at = mysqlTimestamp;
  body.updated_at = mysqlTimestamp;
  body.slug = toSlug(body.name);

  try {
    const results = await brandsModel.create(body);
    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const getBrands = async (req, res) => {
  const query = req.query;

  try {
    const results = await brandsModel.getMultiple(query);
    const resultData = results.data || results;
    resultData.forEach((result) => {
      const createdAt = new Date(result.created_at);
      result.created_at = moment(createdAt).format('YYYY-MM-DD HH:mm:ss');
      const updatedAt = new Date(result.updated_at);
      result.updated_at = moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');
    });
    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const getBrandById = async (req, res) => {
  const params = req.params;

  try {
    const results = await brandsModel.getById(params);
    const result = results[0];

    if (!result) {
      return res.status(404).json({
        success: 0,
        message: 'brand not found',
      });
    }

    const createdAt = new Date(result.created_at);
    result.created_at = moment(createdAt).format('YYYY-MM-DD HH:mm:ss');
    const updatedAt = new Date(result.updated_at);
    result.updated_at = moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');

    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const updateBrand = async (req, res) => {
  const body = req.body;
  if (body.name) {
    body.slug = toSlug(body.name);
  }
  const mysqlTimestamp = new Date();
  body.updated_at = mysqlTimestamp;
  const params = req.params;

  try {
    const results = await brandsModel.update(body, params);
    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const deleteBrand = async (req, res) => {
  const params = req.params;

  try {
    const results = await brandsModel.delete(params);
    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message,
    });
  }
};

module.exports = { createBrand, getBrands, getBrandById, updateBrand, deleteBrand };
