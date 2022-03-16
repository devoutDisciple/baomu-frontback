const express = require('express');

const router = express.Router();
const demandService = require('../service/demandService');

// 创建需求
router.post('/addDemand', (req, res) => {
	demandService.addDemand(req, res);
});

// 根据地理位置获取需求
router.get('/demandByAddress', (req, res) => {
	demandService.getDemandByAddress(req, res);
});

module.exports = router;