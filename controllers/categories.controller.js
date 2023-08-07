require('dotenv').config();
const { toSlug } = require('../helper');
const categoriesModel = require('../models/categories.model');
const moment = require('moment');

const createCategory = async (req, res) => {
  const body = req.body;
  const mysqlTimestamp = new Date();
  body.created_at = mysqlTimestamp;
  body.updated_at = mysqlTimestamp;
  body.slug = toSlug(body.name);

  try {
    const results = await categoriesModel.create(body);
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

const getCategories = async (req, res) => {
  const query = req.query;

  try {
    const results = await categoriesModel.getMultiple(query);
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

const getCategoryById = async (req, res) => {
  const params = req.params;

  try {
    const results = await categoriesModel.getById(params);
    const result = results[0];

    if (!result) {
      return res.status(404).json({
        success: 0,
        message: 'category not found',
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

const updateCategory = async (req, res) => {
  const body = req.body;
  if (body.name) {
    body.slug = toSlug(body.name);
  }
  const mysqlTimestamp = new Date();
  body.updated_at = mysqlTimestamp;
  const params = req.params;

  try {
    const results = await categoriesModel.update(body, params);
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

const deleteCategory = async (req, res) => {
  const params = req.params;

  try {
    const results = await categoriesModel.delete(params);
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

module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
