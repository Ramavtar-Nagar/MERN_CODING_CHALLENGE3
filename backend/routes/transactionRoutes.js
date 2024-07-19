const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.get('/initialize', transactionController.initializeDatabase);
router.get('/transactions', transactionController.listTransactions);
router.get('/statistics', transactionController.getStatistics);
router.get('/bar-chart', transactionController.getBarChart);
router.get('/pie-chart', transactionController.getPieChart);
router.get('/all-data', transactionController.getAllData);

module.exports = router;
