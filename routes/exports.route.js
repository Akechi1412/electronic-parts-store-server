const e = require('express');
const { exportProducts } = require('../controllers/exports.controller');
const router = require('express').Router();

router.get('/products', exportProducts);

module.exports = router;
