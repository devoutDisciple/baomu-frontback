const express = require('express');

const router = express.Router();
const testService = require('../service/testService');

// 获取用户基本信息，通过userid
router.get('/test', (req, res) => {
	testService.test(req, res);
});

module.exports = router;
