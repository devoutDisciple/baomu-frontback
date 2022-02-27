const express = require('express');

const router = express.Router();
const typeService = require('../service/typeService');

// 获取所有类别
router.get('/allType', (req, res) => {
	typeService.getAllType(req, res);
});

module.exports = router;
