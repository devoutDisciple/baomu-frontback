const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const wechatUtil = require('../util/wechatUtil');
const config = require('../config/config');
const demand = require('../models/demand');
const pay = require('../models/pay');
const responseUtil = require('../util/responseUtil');

const payModal = pay(sequelize);
const demandModal = demand(sequelize);

const timeformat = 'YYYY-MM-DD HH:mm:ss';

module.exports = {
	// 议价确定，支付订单金额
	getPaySign: async (req, res) => {
		try {
			const { demand_id, open_id } = req.query;
			if (!demand_id || !open_id) return res.send(resultMessage.error('系统错误'));
			const attach = {
				demand_id,
			};
			let result = await wechatUtil.wechatPay({ money: 0.01, openId: open_id, attach, description: '支付需求费用' });
			result = {
				timeStamp: parseInt(`${+new Date() / 1000}`, 10).toString(),
				packageSign: result.package,
				paySign: result.paySign,
				nonceStr: result.nonceStr,
				appId: config.wx_appid,
				signType: 'RSA',
			};
			console.log(result, 1122);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 需求方支付，在议价确定之后，支付订单金额
	payByShoper: async (req, res) => {
		try {
			// open_id, user_id, demand_id: demand_id, pay_type: 1
			const { user_id, demand_id, open_id } = req.body;
			if (!demand_id || !open_id || !user_id) return res.send(resultMessage.error('系统错误'));
			const demandDetail = await demandModal.findOne({
				where: { id: demand_id },
				attribute: ['id', 'final_price'],
			});
			const attach = {
				demandId: demand_id,
				userId: user_id,
				type: 1, // 1-商户付款 2-付款给演员
				payType: 1, // 1-付款 2-退款 3-其他
			};
			let result = await wechatUtil.wechatPay({
				money: demandDetail.final_price,
				// money: 0.01,
				openId: open_id,
				attach,
				description: '支付需求费用',
			});
			result = {
				timeStamp: parseInt(`${+new Date() / 1000}`, 10).toString(),
				packageSign: result.package,
				paySign: result.paySign,
				nonceStr: result.nonceStr,
				appId: config.wx_appid,
				signType: 'RSA',
			};
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 处理微信付款回调
	handleWechatPay: async (req, res) => {
		try {
			const body = req.body;
			if (!body || !body.resource || !body.resource.ciphertext) {
				return {};
			}
			const result = await wechatUtil.getPayNotifyMsg(body);
			if (!result.out_trade_no || !result.transaction_id) {
				return res.send(resultMessage.error('系统错误'));
			}
			// 解密后的数据
			// {
			//     mchid: '1618427379',
			//     appid: 'wx768242fa111870e0',
			//     out_trade_no: 'AU9EA5G4FOBK1641908962009',商户系统内部订单号
			//     transaction_id: '4200001351202201114267927862', //微信支付订单号
			//     trade_type: 'JSAPI',
			//     trade_state: 'SUCCESS',
			//     trade_state_desc: '支付成功',
			//     bank_type: 'OTHERS',
			//     attach: '{"demandId":29,"userId":8,"type":1,"payType":1}',
			//     success_time: '2022-01-11T21:49:31+08:00',
			//     payer: { openid: 'odZ0M5iAUE3HxagunKf7kA7qbBBQ' },
			//     amount: { total: 2, payer_total: 2, currency: 'CNY', payer_currency: 'CNY' }
			//   }
			const attach = JSON.parse(result.attach);
			// {"demandId":29,"userId":8,"type":1,"payType":1}
			// 查询是否存在该账单
			const payRecode = await payModal.findOne({
				where: {
					user_id: attach.userId,
					open_id: result.payer.openid,
					out_trade_no: result.out_trade_no,
					transaction_id: result.transaction_id,
					type: attach.type,
					pay_type: attach.payType,
				},
			});
			if (payRecode) return res.send(resultMessage.success('success'));
			// 创建该账单
			await payModal.create({
				user_id: attach.userId,
				open_id: result.payer.openid,
				demand_id: attach.demandId,
				out_trade_no: result.out_trade_no,
				transaction_id: result.transaction_id,
				trade_state: result.trade_state,
				type: attach.type,
				pay_type: attach.payType,
				money: result.amount.payer_total,
				create_time: moment().format(timeformat),
			});
			// 更改需求状态 1-竞价进行中 2-竞价结束，需求进行中（未支付） 3-需求进行中（已支付） 4-需求取消  5-待付款给用户 6-交易成功 7-交易取消
			await demandModal.update({ state: 3 }, { where: { id: attach.demandId } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 获取用户的支付记录
	getAllPayByUserId: async (req, res) => {
		try {
			const { user_id } = req.query;
			if (!user_id) return res.send(resultMessage.success([]));
			const commonFields = ['id', 'pay_type', 'type', 'out_trade_no', 'money', 'create_time'];
			const payRecords = await payModal.findAll({
				where: { user_id, is_delete: 1 },
				attributes: commonFields,
			});
			const result = responseUtil.renderFieldsAll(payRecords, commonFields);
			result.forEach((item) => {
				item.create_time = moment(item.create_time).format('YYYY-MM-DD HH:mm:ss');
				item.money = Number(Number(item.money) / 100).toFixed(2);
				item.pay_type = Number(item.pay_type);
			});
			// 创建订单信息
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取用户账户余额
	getUserAccountMoney: async (req, res) => {
		try {
			const { user_id } = req.query;
			if (!user_id) return res.send(resultMessage.success({ data: 0 }));
			// 所有待支付给用户的钱
			const pay_money = await payModal.sum('money', {
				where: {
					user_id,
					type: 2,
					trade_state: 'PENDDING', // SUCCESS:成功  PENDDING: 等待中 其他均为失败
				},
			});
			// 所有未退款的钱
			const refund_money = await payModal.sum('money', {
				where: {
					user_id,
					type: 3,
					refund_status: ['PENDDING'], // SUCCESS:成功  PENDDING: 等待中 其他均为失败
				},
			});
			// 待退款给用户的钱加上待支付给用户的钱
			const total_money = Number(Number(pay_money) + Number(refund_money)).toFixed(2);
			res.send(resultMessage.success({ data: total_money }));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 处理微信退款通知
	handleWechatRefunds: async (req, res) => {
		try {
			const body = req.body;
			if (!body || !body.resource || !body.resource.ciphertext) {
				return {};
			}

			// {
			//     mchid: '1618427379',
			//     out_trade_no: 'MAJ2EKE6VK071641915233738', // 原支付交易对应的商户订单号
			//     transaction_id: '4200001344202201110769792875',//微信支付交易订单号
			//     out_refund_no: 'fdf943jjfdsgjoi9e',//商户系统内部的退款单号
			//     refund_id: '50302000552022011316424495695',//微信支付退款单号
			//     refund_status: 'SUCCESS',
			//     success_time: '2022-01-13T21:45:25+08:00',
			//     amount: { total: 2, refund: 1, payer_total: 2, payer_refund: 1 },
			//     user_received_account: '支付用户零钱'
			//   }

			const result = await wechatUtil.getRefundsNotifyMsg(body);
			// // 查询该条退款信息是否存在
			const refundRecord = await payModal.findOne({
				where: {
					out_trade_no: result.out_trade_no,
					transaction_id: result.transaction_id,
					out_refund_no: result.out_refund_no,
					refund_id: result.refund_id,
					refund_status: 'SUCCESS',
				},
			});
			// 如果存在该条退款信息
			if (refundRecord) return res.send(resultMessage.success('success'));
			// 查询对应的支付信息
			const payDetail = await payModal.findOne({
				where: {
					out_trade_no: result.out_trade_no,
					trade_state: 'SUCCESS',
					type: 1, // 1-商户付款 2-付款给演员 3-退款给商户 4-退款给用户
				},
			});
			let params = {
				type: 3,
				out_trade_no: result.out_trade_no,
				transaction_id: result.transaction_id,
				out_refund_no: result.out_refund_no,
				refund_id: result.refund_id,
				refund_status: result.refund_status,
				money: result.amount.refund,
				create_time: moment(result.success_time).format(timeformat),
			};
			if (payDetail) {
				params = {
					...params,
					user_id: payDetail.user_id,
					open_id: payDetail.open_id,
					demand_id: payDetail.demand_id,
				};
				// // 创建退款支付信息
				await payModal.create(params);
			}
			// 更改需求状态为退款
			await demandModal.update({ state: 4 }, { where: { id: payDetail.demand_id } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
