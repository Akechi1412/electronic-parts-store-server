const { insertProducts } = require('../controllers/import.controller');
const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'importFiles/' });

router.post('/products', upload.single('productFile'), insertProducts);

module.exports = router;
