const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categories.controller');
const router = require('express').Router();
const { verifyAccessToken, isAdmin } = require('../middlewares/auth');

router.post('/', verifyAccessToken, isAdmin, createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.patch('/:id', verifyAccessToken, isAdmin, updateCategory);
router.delete('/:id', verifyAccessToken, isAdmin, deleteCategory);

module.exports = router;
