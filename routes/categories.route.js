const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categories.controller');
const router = require('express').Router();
const { verifyAccessToken, isAdmin } = require('../middlewares/auth');
const { checkDuplicateCategoryName, checkValidToDelete } = require('../middlewares/verifyCategory');

router.post('/', verifyAccessToken, isAdmin, checkDuplicateCategoryName, createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.patch('/:id', verifyAccessToken, isAdmin, updateCategory);
router.delete('/:id', verifyAccessToken, isAdmin, checkValidToDelete, deleteCategory);

module.exports = router;
