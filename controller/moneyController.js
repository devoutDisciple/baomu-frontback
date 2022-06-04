const express = require('express');

const router = express.Router();
const moneyService = require('../service/moneyService');

// 获取账户余额
router.get('/allMoney', (req, res) => {
	moneyService.getAllMoney(req, res);
});

// 用户提现 withdraw
router.post('/withdraw', (req, res) => {
	moneyService.withdraw(req, res);
});

// 用户提现 withdraw
router.get('/allRecord', (req, res) => {
	moneyService.getUserMoneyRecord(req, res);
});

module.exports = router;
