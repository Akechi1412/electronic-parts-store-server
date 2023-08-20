require('dotenv').config();
const { toSlug } = require('../helper');
const productsModel = require('../models/products.model');
const config = require('../config');
const { customAlphabet } = require('nanoid/async');
const moment = require('moment');

const createProduct = async (req, res) => {
  const body = req.body;
  const nanoid = customAlphabet(config.idAlphabet, config.idLength);
  body.id = BigInt(await nanoid());
  const mysqlTimestamp = new Date();
  body.created_at = mysqlTimestamp;
  body.updated_at = mysqlTimestamp;
  body.slug = toSlug(body.name) + `-${body.id}`;
  if (!body.hidden) {
    body.hidden = 0;
  }
  if (!body.new) {
    body.new = 0;
  }
  if (!body.featured) {
    body.featured = 0;
  }
  if (!body.bestseller) {
    body.bestseller = 0;
  }
  if (!body.freeship) {
    body.freeship = 0;
  }
  if (!body.discount) {
    body.discount = 0;
  }
  if (!body.warranty) {
    body.warranty = 0;
  }
  if (body.start_at) {
    body.start_at = new Date(body.start_at);
  }
  if (body.end_at) {
    body.end_at = new Date(body.end_at);
  }

  try {
    const results = await productsModel.create(body);
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

const getProducts = async (req, res) => {
  const query = req.query;

  try {
    const results = await productsModel.getMultiple(query);
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

const getProductById = async (req, res) => {
  const params = req.params;

  try {
    const results = await productsModel.getById(params);
    const result = results[0];

    if (!result) {
      return res.status(404).json({
        success: 0,
        message: 'product not found',
      });
    }

    if (result.start_at) {
      const starAt = new Date(result.created_at);
      result.start_at = moment(starAt).format('YYYY-MM-DD HH:mm:ss');
    }
    if (result.end_at) {
      const endAt = new Date(result.updated_at);
      result.end_at = moment(endAt).format('YYYY-MM-DD HH:mm:ss');
    }

    const createdAt = new Date(result.created_at);
    result.created_at = moment(createdAt).format('YYYY-MM-DD HH:mm:ss');
    const updatedAt = new Date(result.updated_at);
    result.updated_at = moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');

    return res.status(200).json({
      success: 1,
      data: result,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const updateProduct = async (req, res) => {
  const body = req.body;
  const mysqlTimestamp = new Date();
  body.updated_at = mysqlTimestamp;
  const params = req.params;
  if (body.name) {
    body.slug = toSlug(body.name) + `-${params.id}`;
  }

  try {
    const results = await productsModel.update(body, params);
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

const deleteProduct = async (req, res) => {
  const params = req.params;

  try {
    const results = await productsModel.delete(params);
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

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
