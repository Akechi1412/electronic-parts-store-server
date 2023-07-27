const express = require('express');
const router = express.Router();
const { getMultiple } = require('../models/categories.model');

router.get('/', async function (req, res, next) {
  try {
    const { page, limit, name } = req.query;
    res.json(await getMultiple(page, limit, name));
  } catch (error) {
    console.error(`Error while getting categories `, error.message);
    next(error);
  }
});

module.exports = router;
