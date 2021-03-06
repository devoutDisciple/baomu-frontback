const loginController = require('./loginController');
const userController = require('./userController');
const wechatController = require('./wechatController');
const instrumentController = require('./instrumentController');
const demandController = require('./demandController');
const skillController = require('./skillController');
const levelController = require('./levelController');
const schoolController = require('./schoolController');
const awardController = require('./awardController');
const idcardConroller = require('./idcardConroller');
const productionController = require('./productionController');
const videoController = require('./videoController');
const replyController = require('./replyController');
const goodsController = require('./goodsController');
const priceRecordController = require('./priceRecordController');
const messageController = require('./messageController');
const teamController = require('./teamController');
const payController = require('./payController');
const demandEvaluateController = require('./demandEvaluateController');
const deviceController = require('./deviceController');
const attentionController = require('./attentionController');
// const baomuController = require('./baomuController');
const moneyController = require('./moneyController');

const router = (app) => {
	// 登录相关
	app.use('/login', loginController);
	// 用户相关
	app.use('/user', userController);
	// 微信功能
	app.use('/wechat', wechatController);
	// 乐器相关
	app.use('/instrument', instrumentController);
	// 需求相关
	app.use('/demand', demandController);
	// 技能相关
	app.use('/skill', skillController);
	// 考级相关
	app.use('/level', levelController);
	// 学校认证相关
	app.use('/school', schoolController);
	// 获奖认证相关
	app.use('/award', awardController);
	// 身份证相关
	app.use('/idcard', idcardConroller);
	// 作品相关
	app.use('/production', productionController);
	// 上传视频
	app.use('/video', videoController);
	// 评论相关
	app.use('/reply', replyController);
	// 点赞相关
	app.use('/goods', goodsController);
	// 报价相关
	app.use('/priceRecord', priceRecordController);
	// 消息相关
	app.use('/message', messageController);
	// 乐队相关
	app.use('/team', teamController);
	// 关注相关
	app.use('/attention', attentionController);
	// 支付相关
	app.use('/pay', payController);
	// 需求评价相关
	app.use('/demandEvaluate', demandEvaluateController);
	// 其他相关（摄影棚什么的）
	app.use('/device', deviceController);
	// 账户余额相关
	app.use('/money', moneyController);
	// // 暂时支付
	// app.use('/baomupay', baomuController);
};
module.exports = router;
