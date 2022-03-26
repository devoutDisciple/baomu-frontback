const express = require('express');

const router = express.Router();
const priceRecordService = require('../service/priceRecordService');

// 创建需求
router.post('/add', (req, res) => {
	priceRecordService.addPrice(req, res);
});

module.exports = router;
