const testController = require('./testController');
const loginController = require('./loginController');
const payController = require('./payController');
const wechatController = require('./wechatController');
const swiperController = require('./swiperController');
const typeController = require('./typeController');
const projectController = require('./projectController');
const subjectController = require('./subjectController');
const orderController = require('./orderController');
const teamController = require('./teamController');
const userController = require('./userController');
const baomuController = require('./baomuController');

const router = (app) => {
	// 登录相关
	app.use('/login', loginController);
	// 测试相关
	app.use('/test', testController);
	// 支付相关
	app.use('/pay', payController);
	// 小程序相关
	app.use('/wechat', wechatController);
	// 轮播图相关
	app.use('/swiper', swiperController);
	// 类别相关
	app.use('/type', typeController);
	// 班级相关
	app.use('/project', projectController);
	// 课程相关
	app.use('/subject', subjectController);
	// 订单相关
	app.use('/order', orderController);
	// 组团相关
	app.use('/team', teamController);
	// 用户相关
	app.use('/user', userController);
	// 鲍姆演绎相关
	app.use('/baomu', baomuController);
};
module.exports = router;
