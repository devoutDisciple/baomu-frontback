const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const config = require('../config/config');
const pay = require('../models/pay');
const user = require('../models/user');
const money = require('../models/money');
const calculate = require('../util/calculate');

const moneyModal = money(sequelize);
const userModal = user(sequelize);
const payModal = pay(sequelize);
const wechatCompany = require('../util/wechatCompany');
const ObjectUtil = require('../util/ObjectUtil');

const timeformat = 'YYYY-MM-DD HH:mm:ss';

const getUserAccount = async (user_id) => {
	const moneyList = await moneyModal.findAll({
		attributes: ['user_id', 'type', 'state', 'total_money'],
		where: { user_id },
	});
	let sumMoney = 0; // 总金额
	let freezeMoney = 0; // 冻结金额  提现进行中金额
	let availableMoney = 0; // 可用金额
	if (Array.isArray(moneyList)) {
		moneyList.forEach((item) => {
			// 演出所得
			if (Number(item.type) === 1) {
				sumMoney = calculate.sum(sumMoney, item.total_money);
			}
			// 退款所得
			if (Number(item.type) === 2) {
				sumMoney = calculate.sum(sumMoney, item.total_money);
			}
			// 金额提现
			if (Number(item.type) === 3) {
				sumMoney = calculate.sub(sumMoney, item.total_money);
				// 提现时候才有的状态 PROCESSING ：转账中 SUCCESS ：转账成功 FAIL ：转账失败
				// 提现进行中
				if (item.state === 'PROCESSING') {
					freezeMoney = calculate.sum(freezeMoney, item.total_money);
				}
			}
		});
	}
	// 可用金额
	availableMoney = calculate.sub(sumMoney, freezeMoney);
	sumMoney = Number(sumMoney).toFixed(2);
	return {
		sumMoney: Number(sumMoney).toFixed(2), // 总金额
		availableMoney: Number(availableMoney).toFixed(2), // 可用金额
		freezeMoney: Number(freezeMoney).toFixed(2), // 提现金额
	};
};

module.exports = {
	// 获取账户余额
	getAllMoney: async (req, res) => {
		try {
			const { user_id } = req.query;
			if (!user_id) return res.send(resultMessage.error('系统错误'));
			const {
				sumMoney, // 总金额
				availableMoney, // 可用金额
				freezeMoney, // 提现金额
			} = await getUserAccount(user_id);
			res.send(resultMessage.success({ sumMoney, availableMoney, freezeMoney }));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 用户发起提现
	withdraw: async (req, res) => {
		try {
			// open_id, user_id, demand_id: demand_id
			const { user_id, total_money } = req.body;
			if (!user_id || !total_money) return res.send(resultMessage.error('系统错误'));

			// 金额有误
			if (!Number(total_money) > 0) {
				return res.send(resultMessage.error('输入金额有误'));
			}

			const {
				availableMoney, // 可用金额
			} = await getUserAccount(user_id);

			// 如果提现金额大于可用金额
			if (Number(total_money) > availableMoney) {
				return res.send(resultMessage.error('提现金额不足'));
			}

			const userDetail = await userModal.findOne({
				attributes: ['id', 'wx_openid', 'username', 'is_name'],
				where: { id: user_id },
			});
			if (!userDetail.username) return res.send(resultMessage.error('未实名用户'));

			// 实际提现，可用金额 X 税率 之后的金额
			const real_money = calculate.mul(total_money, config.WITHDRAW_RATE);

			const out_detail_no = ObjectUtil.getUuid();
			// 进行提现操作
			const result = await wechatCompany.payForPeople({
				money: calculate.mul(real_money, 100),
				openid: userDetail.wx_openid,
				username: userDetail.username,
				out_detail_no,
			});

			// result的返回值
			// {
			//     batch_id: '1030000048801375938082022060300844741378', // 微信批次单号
			//   create_time: '2022-06-03T10:50:16+08:00',// 批次创建时间
			//   out_batch_no: 'NNO5LF5YY720FD42IZI7ZWR3E7ZD0MH5'  // 商家批次单号
			// }

			if (!result.batch_id || !result.out_batch_no) {
				return res.send(resultMessage.error('提现失败'));
			}

			// 支付表添加一条金额记录
			const payDetail = await payModal.create({
				user_id: userDetail.id,
				open_id: userDetail.wx_openid,
				batch_id: result.batch_id,
				out_batch_no: result.out_batch_no,
				out_detail_no,
				batch_status: 'WAIT_PAY', // 系统转账的-状态 WAIT_PAY：待付款 ACCEPTED:已受理 PROCESSING:转账中 FINISHED：已完成 CLOSED：已关闭
				batch_detail_status: 'PROCESSING', // 系统转账的-明细状态   PROCESSING：转账中 SUCCESS：转账成功 FAIL：转账失败
				money: real_money,
				create_time: moment().format(timeformat),
				is_delete: 1,
			});

			// 给用户余额增加一条提现记录
			const moneyDetail = await moneyModal.create({
				user_id: userDetail.id,
				type: 1, // 1-演出所得 2-退款所得 3-金额提现
				total_money, // 提现的总金额
				real_money, // 提现时候的真实金额
				rate: config.WITHDRAW_RATE, // 提现费率
				rate_money: calculate.sub(total_money, real_money),
				state: 'PROCESSING', // 提现时候才有的状态 PROCESSING：转账中 SUCCESS：转账成功 FAIL：转账失败
				create_time: moment().format(timeformat),
				is_delete: 1,
			});

			res.send(resultMessage.success(result));

			// {
			// 	limit: 20,
			// 	offset: 0,
			// 	transfer_batch: {
			// 		appid: 'wx3141bfc9a71cbe70',
			// 		batch_id: '1030000048801375938082022060400845038255',
			// 		batch_name: '演出费用',
			// 		batch_remark: '演员的演出费用支付',
			// 		batch_status: 'FINISHED',
			// 		batch_type: 'API',
			// 		create_time: '2022-06-04T02:11:54+08:00',
			// 		fail_amount: 0,
			// 		fail_num: 0,
			// 		out_batch_no: '2YGSD6EJM5ZQUQRT9M1654279913442',
			// 		success_amount: 34,
			// 		success_num: 1,
			// 		total_amount: 34,
			// 		total_num: 1,
			// 		update_time: '2022-06-04T02:11:54+08:00',
			// 	},
			// 	transfer_detail_list: [
			// 		{
			// 			detail_id: '1040000048801375938082022060400842538810',
			// 			detail_status: 'SUCCESS',
			// 			out_detail_no: 'X21O0LQDFRGQYTEP301654279913442',
			// 		},
			// 	],
			// };
			let num = 0;
			// 查询转账记录
			const onSearchDetail = async () => {
				num++;
				if (num > 50) return;
				const billDetail = await wechatCompany.searchDetail({ batch_id: result.batch_id });
				console.log(billDetail, 233);
				if (billDetail.transfer_batch && Array.isArray(billDetail.transfer_detail_list)) {
					// 更新账单
					await payModal.update(
						{
							batch_status: billDetail.transfer_batch.batch_status,
							batch_detail_status: billDetail.transfer_detail_list[0].detail_status,
						},
						{
							where: {
								id: payDetail.id,
							},
						},
					);
					console.log('转账成功，支付记录更新成功');
					// 更新余额
					await moneyModal.update({ state: 'SUCCESS' }, { where: { id: moneyDetail.id } });
					console.log('转账成功，余额信息更新成功');
				} else {
					setTimeout(() => {
						onSearchDetail();
					}, num * 60 * 1000);
				}
				// if (global.timer[timerUuid]) {
				// 	clearInterval(global.timer[timerUuid]);
				// }
			};
			onSearchDetail();
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
