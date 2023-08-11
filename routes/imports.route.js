const { insertProducts } = require('../controllers/imports.controller');
const router = require('express').Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post('/products', upload.single('productFile'), insertProducts);

module.exports = router;
