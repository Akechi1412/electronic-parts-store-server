const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/products.controller');
const router = require('express').Router();
const { verifyAccessToken, isAdmin } = require('../middlewares/auth');

router.post('/', verifyAccessToken, isAdmin, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.patch('/:id', verifyAccessToken, isAdmin, updateProduct);
router.delete('/:id', verifyAccessToken, isAdmin, deleteProduct);

module.exports = router;
