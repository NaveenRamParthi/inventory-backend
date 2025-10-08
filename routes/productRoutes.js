const express = require('express');
const router = express.Router();
const { list, create, delete: remove } = require('../controllers/productController');

router.get('/', list);
router.post('/', create);
router.delete('/:id', remove);

module.exports = router;
