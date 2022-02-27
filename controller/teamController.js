const express = require('express');

const router = express.Router();
const teamService = require('../service/teamService');

// 获取组团基本信息
router.get('/teamDetailByTeamUuid', (req, res) => {
	teamService.getTeamDetailByTeamUuid(req, res);
});

// 获取组团进度
router.get('/teamDetailAndProcessByUserid', (req, res) => {
	teamService.getTeamDetailAndProcessByUserid(req, res);
});

module.exports = router;
