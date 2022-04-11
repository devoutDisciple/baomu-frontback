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

// 根据输入框查询需求
router.get('/deamandByIptValue', (req, res) => {
	demandService.getDeamandByIptValue(req, res);
});

// 获取需求详情
router.get('/detailById', (req, res) => {
	demandService.getDetailById(req, res);
});

// 直接报名需求
router.post('/signDemand', (req, res) => {
	demandService.signDemand(req, res);
});

// 查询个人演出记录获取需求
router.get('/demandByUserId', (req, res) => {
	demandService.getDemandByUserId(req, res);
});

module.exports = router;
