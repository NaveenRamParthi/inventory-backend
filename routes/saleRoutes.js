const express = require('express');
const router = express.Router();
const { createSale, listSales, getSale } = require('../controllers/saleController');

router.post('/', createSale);
router.get('/', listSales);
router.get('/:id', getSale);

module.exports = router;
