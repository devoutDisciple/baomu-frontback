const fs = require('fs');
const WxPay = require('wechatpay-node-v3');
const path = require('path');
const request = require('request');
const config = require('../config/config');
const ObjectUtil = require('./ObjectUtil');
const baomoConfig = require('../config/baomuConfig');

// 使用框架
const pay = new WxPay({
	appid: config.wx_appid,
	mchid: config.wechat_mchid,
	publicKey: fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_cert.pem')), // 公钥
	privateKey: fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_key.pem')), // 秘钥
});

module.exports = {
	// 微信支付，获取签名
	wechatPay: ({ money, openId, userid, type, subject_id, project_id, teamUuid, description }) => {
		// money:单位元，微信支付单位是分
		// openid:用户的openid
		return new Promise(async (resolve, reject) => {
			try {
				// 附加数据
				const attach = {
					userid,
					// 1-报名费用 2-组团费用
					type,
					subId: subject_id,
					proId: project_id,
				};
				// 组团的唯一标识
				if (type === 2) attach.tid = teamUuid;
				console.log(JSON.stringify(attach), '支付传输数据');
				const params = {
					// 订单编号
					out_trade_no: `${ObjectUtil.getRandomStr(12)}${new Date().getTime()}`,
					notify_url: config.wechat_pay_notify_url,
					amount: {
						total: Number((money * 100).toFixed(0)), // 单位分
						currency: 'CNY',
					},
					attach: JSON.stringify(attach),
					payer: { openid: openId },
					description,
				};
				const result = await pay.transactions_jsapi(params);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	},

	// 获取accessToken
	getAccessToken: () => {
		const grant_type = 'client_credential';
		return new Promise((resolve, reject) => {
			try {
				request.get(
					`${config.wechat_accessToken_url}?grant_type=${grant_type}&appid=${config.wx_appid}&secret=${config.wx_appSecret}`,
					async (error, res, body) => {
						// {"access_token":"52_3lDXa1NbGIaxUDn2TWg9_jHAIAuMWdNNz4NfY1Gd4dPq5GhyMGk5S_Ei6lvsv5lr3KpI9if6odYq4utl_3_Q1BwQ_QS00tevSpv1BetKMzqTpG0hur7vh5kVbT62CUOHbLzRpmOhM6DhElfdBVKiACAVPE","expires_in":7200}
						if (error) {
							reject(error);
							return;
						}
						const result = JSON.parse(body);
						resolve(result);
					},
				);
			} catch (error) {
				reject(error);
			}
		});
	},

	// 获取用户session_key和openid
	getUserSessionKey: (code) => {
		return new Promise((resolve, reject) => {
			try {
				request.get(
					`${config.wechat_openid_url}?appid=${config.wx_appid}&secret=${config.wx_appSecret}&js_code=${code}&grant_type=${config.wx_grantType}`,
					async (error, response, body) => {
						if (error) reject(error);
						resolve(JSON.parse(body));
					},
				);
			} catch (error) {
				console.log(error);
				reject(error);
			}
		});
	},

	// 获取用户session_key和openid
	getUserSessionKeyByBaoMu: (code) => {
		return new Promise((resolve, reject) => {
			try {
				const appid = baomoConfig.appid;
				const secret = baomoConfig.appsecret;
				const wx_grantType = baomoConfig.wx_grantType;
				request.get(
					`${config.wechat_openid_url}?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=${wx_grantType}`,
					async (error, response, body) => {
						if (error) reject(error);
						resolve(JSON.parse(body));
					},
				);
			} catch (error) {
				console.log(error);
				reject(error);
			}
		});
	},

	// 解密回调数据
	getPayNotifyMsg: (body) => {
		// 返回的数据
		// {
		// 	id: '32d57372-3153-59cf-a59e-df9f831316b6',
		// 	create_time: '2022-01-04T21:44:00+08:00',
		// 	resource_type: 'encrypt-resource',
		// 	event_type: 'TRANSACTION.SUCCESS',
		// 	summary: '支付成功',
		// 	resource: {
		// 		original_type: 'transaction',
		// 		algorithm: 'AEAD_AES_256_GCM',
		// 		ciphertext:
		// 			'uPvSsbOLNeotgNLKMM6qBfvPuAM/gZdBdjCHDAgVG9Ji1p4ie8w76oouYoX5I8eosBbLFzXMFeBRHsYmL6s0v9d0J0te+DAp5R1uHXbQR/dO98Mhym6fM/bj/gXKJPCwsYeIu8aKRvyMdK1VPkq6jFIUt4i8fxEImm7IwMIWr5jrWKA1vQzq7APahrc9bPTDGosi0UI0t9TaKjY4KnrEYX7oa/wM390fUDFWES3P5yefQuvyW2WV2Y7br2QmVoETljACT1rT2g33+R/6Fn+LIdARUP7EDSMZqAP1K6d4D4My8qMtWUbNYs2bbV+A84++aYHqgik8zI70L0Jmsko6SMolQ/KgpGIbhiBtLMCsWZ+5KqWzyW/GhDm+UINLC7iGU2w2nVqLJZE41O2V+dOeAru2VgolzVgHXLg3U5kpTAdIoV1Wmo0mSP3B8sDSchQ41YiaHIbj9CW7VO7/eSEZ7DXZlkua+mQksJEphtd/BUwQ/HjmBvC36Lq/I7aS1IlJINOxJF17Pvr38rZcA85F9+q+BOGLru8JvgBFqCXASBuU3I6D3RFxNM5JZtIrFAmJ7a5lDat7ZO0w98j1pS8O',
		// 		associated_data: 'transaction',
		// 		nonce: 'iAB5rtnU5wGs',
		// 	},
		// };

		// 解密后的数据
		// {
		//     mchid: '1618427379',
		//     out_trade_no: 'MAJ2EKE6VK071641915233738',
		//     transaction_id: '4200001344202201110769792875',
		//     out_refund_no: 'fdf943jjfdsgjoi9e',
		//     refund_id: '50302000552022011316424495695',
		//     refund_status: 'SUCCESS',
		//     success_time: '2022-01-13T21:45:25+08:00',
		//     amount: { total: 2, refund: 1, payer_total: 2, payer_refund: 1 },
		//     user_received_account: '支付用户零钱'
		//   }
		return new Promise(async (resolve, reject) => {
			try {
				if (!body || !body.resource || !body.resource.ciphertext) {
					reject({});
				}
				const result = pay.decipher_gcm(
					body.resource.ciphertext,
					body.resource.associated_data,
					body.resource.nonce,
					config.wx_apiv3_secret,
				);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	},

	// 发起退款
	payRefunds: ({ transaction_id, out_refund_no, refund, total }) => {
		return new Promise(async (resolve, reject) => {
			try {
				const params = {
					transaction_id, // 微信订单号
					out_refund_no, // 退款单号
					notify_url: config.wechat_refund_notify_url, // 通知地址
					amount: {
						refund, // 退款金额
						total, // 原来总金额
						currency: 'CNY', // 退款币种
					},
				};
				const result = await pay.refunds(params);
				console.log('退款结果是：', JSON.stringify(result));
				// {
				//   status: 'PROCESSING', // SUCCESS：退款成功 CLOSED：退款关闭 PROCESSING：退款处理中 ABNORMAL：退款异常
				//   amount: {
				//     currency: 'CNY',
				//     discount_refund: 0,
				//     from: [],
				//     payer_refund: 1,
				//     payer_total: 2,
				//     refund: 1,
				//     settlement_refund: 1,
				//     settlement_total: 2,
				//     total: 2
				//   },
				//   channel: 'ORIGINAL',
				//   create_time: '2022-01-12T21:24:33+08:00',
				//   funds_account: 'AVAILABLE',
				//   out_refund_no: 'hjkdsiuwnnj43yejdf8349',
				//   out_trade_no: 'MAJ2EKE6VK071641915233738',
				//   promotion_detail: [],
				//   refund_id: '50302000552022011216389088151',
				//   transaction_id: '4200001344202201110769792875',
				//   user_received_account: '支付用户零钱'
				// }
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	},

	// 处理退款的回调
	getRefundsNotifyMsg: (body) => {
		// 返回的数据
		// {
		//   id: 'ec7254e9-b4df-599d-9293-8d10328f35e4',
		//   create_time: '2022-01-13T21:45:25+08:00',
		//   resource_type: 'encrypt-resource',
		//   event_type: 'REFUND.SUCCESS',
		//   summary: '退款成功',
		//   resource: {
		//     original_type: 'refund',
		//     algorithm: 'AEAD_AES_256_GCM',
		//     ciphertext: 'e8aw0+bPZi7v1I51c8GZbXoB/M+xafDwU966a5cPCJLETK0SB5zufvTKRuEjQ66h1suWzX3M0FDS9XZ0uSiiSK9jqbWHiH8mlpzLqu/tHHs94c4Fb6WxJ9HAb4rhEuYpXpKpJKR2GnVtBwhPs8C5ICNasCuxXfBnvk2fR2KR/R9m/Kl6dDaHLtfLlsLm31xb5CXK9qryoFzT7lmreKBOesczEqcqbh++CPA5aIrNB44sQQwc0NHMupesBLdh8LS52d7bAZp636kP2CPw9/ePjso4hrMuSQ28rqKvd6oc4ZkeJa6EcXn8nZASMeKhb85olqz3g1MAeMWlu0zmhRJ9sXmJbfT3OR0COzFoykL2isQVmApG2AtNhQ4Q89pIEyaqhziPie3GbHaJBOTwUP9Pa+u1IqHfT1b1l3wxowgT1yK3TkKWvBUhEJjAByAqwCCvtE2i+MXhQ4ZWi3B8rGhlmc7fpAIDopCOBIetNu7J6b+W3Fod6yjSdSauHJhxUlRe1G2f+Q==',
		//     associated_data: 'refund',
		//     nonce: '8jYNLS2ynxAx'
		//   }
		// }

		// 解密后的数据
		// {
		//     mchid: '1618427379',
		//     out_trade_no: 'MAJ2EKE6VK071641915233738',
		//     transaction_id: '4200001344202201110769792875',
		//     out_refund_no: 'fdf943jjfdsgjoi9e',
		//     refund_id: '50302000552022011316424495695',
		//     refund_status: 'SUCCESS',
		//     success_time: '2022-01-13T21:45:25+08:00',
		//     amount: { total: 2, refund: 1, payer_total: 2, payer_refund: 1 },
		//     user_received_account: '支付用户零钱'
		//   }
		return new Promise(async (resolve, reject) => {
			try {
				if (!body || !body.resource || !body.resource.ciphertext) {
					reject({});
				}
				const result = pay.decipher_gcm(
					body.resource.ciphertext,
					body.resource.associated_data,
					body.resource.nonce,
					config.wx_apiv3_secret,
				);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	},
};
