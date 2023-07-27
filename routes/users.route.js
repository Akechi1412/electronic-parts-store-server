const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  getUserProfile,
} = require('../controllers/users.controller');
const router = require('express').Router();
const { verifyToken, isAdmin } = require('../middlewares/auth');
const { checkDuplicateUsernameOrEmail } = require('../middlewares/verifySignup');

router.post('/', checkDuplicateUsernameOrEmail, createUser);
router.post('/profile', verifyToken, getUserProfile);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/login', login);

module.exports = router;
