const express = require('express');

const router = express.Router();
const loginService = require('../service/loginService');

// 获取用户基本信息，通过openId
router.post('/loginByWxOpenid', (req, res) => {
	loginService.loginByWxOpenid(req, res);
});

// 获取用户基本信息，通过userId
router.post('/loginByUserId', (req, res) => {
	loginService.loginByUserId(req, res);
});

module.exports = router;
