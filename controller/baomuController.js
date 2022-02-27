const express = require('express');

const router = express.Router();
const baomuService = require('../service/baomuService');

// 鲍姆演艺支付
router.post('/login', (req, res) => {
	baomuService.getLogin(req, res);
});

// 鲍姆演艺支付
router.post('/pay', (req, res) => {
	baomuService.pay(req, res);
});

module.exports = router;
