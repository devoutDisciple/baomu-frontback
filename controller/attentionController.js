const express = require('express');

const router = express.Router();
const attentionService = require('../service/attentionService');

// 添加技能
router.post('/add', (req, res) => {
	attentionService.add(req, res);
});

// 获取是否关注用户
router.get('/userAttentionUser', (req, res) => {
	attentionService.getUserIsAttention(req, res);
});

// 获取所有技能技能
router.post('/cancleAttention', (req, res) => {
	attentionService.cancleAttention(req, res);
});

module.exports = router;
