const loginController = require('./loginController');
const userController = require('./userController');
const wechatController = require('./wechatController');
const instrumentController = require('./instrumentController');
const demandController = require('./demandController');
const skillController = require('./skillController');
const levelController = require('./levelController');

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
};
module.exports = router;
