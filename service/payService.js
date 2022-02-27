const moment = require('moment');
const ObjectUtil = require('../util/ObjectUtil');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const wechatUtil = require('../util/wechatUtil');
const config = require('../config/config');
const subject = require('../models/subject');
const pay = require('../models/pay');
const order = require('../models/order');
const team = require('../models/team');
const responseUtil = require('../util/responseUtil');

const subjectModal = subject(sequelize);
const payModal = pay(sequelize);
const orderModal = order(sequelize);
const teamModal = team(sequelize);

const timeformat = 'YYYY-MM-DD HH:mm:ss';

module.exports = {
	// 下单支付接口
	getPaySign: async (req, res) => {
		try {
			const { openId } = req.query;
			if (!openId) return res.send(resultMessage.error('系统错误'));
			let result = await wechatUtil.wechatPay({ money: 0.01, openId, description: '测试' });
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

	// 报名或者组团支付
	async paySignup(req, res) {
		try {
			// type = 1 报名 type =2 组团
			const { subject_id, project_id, openId, userId, teamId } = req.body;
			let { type } = req.body;
			type = Number(type);
			if (!openId || !subject_id) return res.send(resultMessage.error('系统错误'));
			let teamUuid = `${ObjectUtil.getRandomStr(12)}${parseInt(`${+new Date() / 1000}`, 10).toString()}`;
			// 查看用户是否已组团该课程
			if (Number(type) === 2) {
				const orderDetail = await orderModal.findOne({
					where: { user_id: userId, subject_id, project_id, type },
				});
				if (orderDetail) {
					return res.send(resultMessage.error('您已参与组团'));
				}
				if (teamId) {
					const teamDetail = await teamModal.findOne({ where: { uuid: teamId, is_delete: 1 } });
					// 已经满三人
					if (teamDetail.num === 3) {
						return res.send(resultMessage.error('人数已满'));
					}
					// 已经过了时间
					if (moment(new Date()).diff(moment(teamDetail.end_time), 'minute') > 72 * 60) {
						return res.send(resultMessage.error('组团已过期'));
					}
					teamUuid = teamId;
				}
			}
			// 查看该课程详情
			let detail = await subjectModal.findOne({
				where: { id: subject_id },
				attributes: ['apply_price', 'cluster_price'],
			});
			detail = responseUtil.renderFieldsObj(detail, ['apply_price', 'cluster_price']);
			const money = Number(type) === 1 ? detail.apply_price : detail.cluster_price;
			const desc = Number(type) === 1 ? '报名费用' : '组团费用';
			let result = await wechatUtil.wechatPay({
				money,
				openId,
				userid: userId,
				type: Number(type),
				subject_id,
				project_id,
				teamUuid,
				description: desc,
			});
			result = {
				timeStamp: parseInt(`${+new Date() / 1000}`, 10).toString(),
				packageSign: result.package,
				paySign: result.paySign,
				nonceStr: result.nonceStr,
				appId: config.wx_appid,
			};
			if (type === 2) result.team_uuid = teamUuid;
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
			//     attach: '{"userid":25,"type":2,"subId":1,"proId":1,"tid":"89GEZ0IZXPUW1641908961"}',
			//     success_time: '2022-01-11T21:49:31+08:00',
			//     payer: { openid: 'odZ0M5iAUE3HxagunKf7kA7qbBBQ' },
			//     amount: { total: 2, payer_total: 2, currency: 'CNY', payer_currency: 'CNY' }
			//   }
			result.attach = JSON.parse(result.attach);
			// 查询是否存在该账单
			const payRecode = await payModal.findOne({
				where: {
					user_id: result.attach.userid,
					open_id: result.payer.openid,
					out_trade_no: result.out_trade_no,
					transaction_id: result.transaction_id,
				},
			});
			if (payRecode) return res.send(resultMessage.success('success'));
			// 查询订单是否存在
			const orderRecord = await orderModal.findOne({
				where: {
					user_id: result.attach.userid,
					open_id: result.payer.openid,
					out_trade_no: result.out_trade_no,
					transaction_id: result.transaction_id,
					subject_id: result.attach.subId,
					project_id: result.attach.proId,
					type: result.attach.type,
				},
			});
			if (orderRecord) return res.send(resultMessage.success('success'));
			// 创建该账单
			await payModal.create({
				user_id: result.attach.userid,
				open_id: result.payer.openid,
				out_trade_no: result.out_trade_no,
				transaction_id: result.transaction_id,
				trade_state: result.trade_state,
				type: result.attach.type,
				money: result.amount.payer_total,
				success_time: moment(result.success_time).format(timeformat),
				create_time: moment().format(timeformat),
			});
			// 创建订单
			const orderParams = {
				user_id: result.attach.userid,
				open_id: result.payer.openid,
				out_trade_no: result.out_trade_no,
				transaction_id: result.transaction_id,
				subject_id: result.attach.subId,
				project_id: result.attach.proId,
				type: result.attach.type,
				pay_state: result.trade_state === 'SUCCESS' ? 1 : result.trade_state,
				create_time: moment().format(timeformat),
			};
			if (Number(result.attach.type) === 2) orderParams.team_uuid = result.attach.tid;
			const orderDetail = await orderModal.create({ ...orderParams });
			// 如果是报名，下面的逻辑不用走
			if (Number(result.attach.type) === 1) {
				// subject的报名人数+1
				subjectModal.increment({ total_person: 1, apply_num: 1 }, { where: { id: result.attach.subId } });
				return res.send(resultMessage.success('success'));
			}
			let teamDetail;
			// 如果已存在拼团
			if (result.attach.tid) teamDetail = await teamModal.findOne({ where: { uuid: result.attach.tid } });
			// 如果是发起拼团
			if (!teamDetail) {
				// 创建拼团的订单
				await teamModal.create({
					uuid: result.attach.tid,
					subject_id: result.attach.subId,
					project_id: result.attach.proId,
					start_user_id: result.attach.userid,
					num: 1,
					order_ids: JSON.stringify([orderDetail.id]),
					user_ids: JSON.stringify([result.attach.userid]),
					state: 2, // 拼团状态 1-未开始 2-进行中 3-拼团成功 4-拼团失败 5-拼团结束
					create_time: moment().format(timeformat),
					end_time: moment().add(3, 'days').format(timeformat),
				});
			} else {
				// 如果是与拼团
				const user_ids = JSON.parse(teamDetail.user_ids);
				const order_ids = JSON.parse(teamDetail.order_ids);
				if (!user_ids.includes(result.attach.userid)) {
					user_ids.push(result.attach.userid);
				}
				if (!order_ids.includes(orderDetail.id)) {
					order_ids.push(orderDetail.id);
				}
				const conditions = {
					num: Number(teamDetail.num) + 1,
					user_ids: JSON.stringify(user_ids),
					order_ids: JSON.stringify(order_ids),
				};
				if (conditions.num === 3) conditions.state = 3;
				// 更新拼团订单
				await teamModal.update(conditions, { where: { uuid: result.attach.tid } });
			}
			// subject的拼团人数+1
			subjectModal.increment({ total_person: 1, cluster_num: 1 }, { where: { id: result.attach.subId } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	// 微信退款
	payRefunds: async (req, res) => {
		try {
			const { body } = req;
			const result = await wechatUtil.payRefunds(body);
			console.log('退款返回信息： ', result);
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
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
			console.log(JSON.stringify(result), '微信退款回调数据');
			if (result.refund_status !== 'SUCCESS') return;
			const orderDetail = await orderModal.findOne({
				where: {
					out_trade_no: result.out_trade_no,
					transaction_id: result.transaction_id,
				},
			});
			// 改变订单状态为退款
			await orderModal.update(
				{ pay_state: 2 },
				{
					where: {
						out_trade_no: result.out_trade_no,
						transaction_id: result.transaction_id,
					},
				},
			);
			// 如果是拼团，改变拼团的状态
			if (Number(orderDetail.type) === 2) {
				await teamModal.update(
					{ state: 6 },
					{
						where: {
							uuid: orderDetail.team_uuid,
						},
					},
				);
			}
			// 查询该条退款信息是否存在
			const payRecord = await payModal.findOne({
				where: {
					user_id: orderDetail.user_id,
					open_id: orderDetail.open_id,
					type: orderDetail.type,
					pay_type: 2, // 退款
					out_trade_no: result.out_refund_no,
					transaction_id: result.transaction_id,
					trade_state: result.refund_status,
				},
			});
			// 如果存在该条退款信息
			if (payRecord) return res.send(resultMessage.success('success'));
			// 创建退款支付信息
			await payModal.create({
				user_id: orderDetail.user_id,
				open_id: orderDetail.open_id,
				type: orderDetail.type,
				pay_type: 2, // 退款
				out_trade_no: result.out_refund_no,
				transaction_id: result.transaction_id,
				trade_state: result.refund_status,
				money: result.amount.refund,
				success_time: moment(result.success_time).format(timeformat),
				create_time: moment(result.success_time).format(timeformat),
			});
			const decrementParams = {};
			if (Number(orderDetail.type) === 1) {
				decrementParams.apply_num = 1;
			} else {
				decrementParams.cluster_num = 1;
			}
			decrementParams.total_person = 1;
			// 用户的关注 - 1
			subjectModal.decrement(decrementParams, { where: { id: orderDetail.id } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取用户的支付记录
	getAllPayByUserId: async (req, res) => {
		try {
			const { userId } = req.query;
			if (!userId) return res.send(resultMessage.success([]));
			const commonFields = ['id', 'pay_type', 'out_trade_no', 'money', 'success_time'];
			const payRecords = await payModal.findAll({
				where: { user_id: userId, is_delete: 1 },
				attributes: commonFields,
			});
			const result = responseUtil.renderFieldsAll(payRecords, commonFields);
			result.forEach((item) => {
				item.success_time = moment(item.success_time).format('YYYY-MM-DD HH:mm:ss');
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
};
