const express = require('express');

const router = express.Router();
const userService = require('../service/userService');

// 更新用户基本信息
router.post('/updateInfo', (req, res) => {
	userService.updateInfo(req, res);
});

// 更新用户地理位置
router.post('/updateLocation', (req, res) => {
	userService.updateLocation(req, res);
});

module.exports = router;
