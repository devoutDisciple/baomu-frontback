const fs = require('fs');
const WxPay = require('wechatpay-node-v3');
const path = require('path');
const fetch = require('node-fetch');
const config = require('../config/config');
const ObjectUtil = require('./ObjectUtil');

// 使用框架
const companyPay = new WxPay({
	appid: config.wx_appid,
	mchid: config.wechat_mchid,
	publicKey: fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_cert.pem')), // 公钥
	privateKey: fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_key.pem')), // 秘钥
});

// 支付成功返回

// {
//     batch_id: '1030000048801375938082022060300844741378', // 微信批次单号
//   create_time: '2022-06-03T10:50:16+08:00',// 批次创建时间
//   out_batch_no: 'NNO5LF5YY720FD42IZI7ZWR3E7ZD0MH5'  // 商家批次单号
// }

// c查询返回
// {
// 	limit: 20,
// 	offset: 0,
// 	transfer_batch: {
// 		appid: 'wx3141bfc9a71cbe70',
// 		batch_id: '1030000048801375938082022060300844789553',
// 		batch_name: '测试转账',
// 		batch_remark: '2022年6月',
// 		batch_status: 'FINISHED',
// 		batch_type: 'API',
// 		create_time: '2022-06-03T14:05:08+08:00',
// 		fail_amount: 0,
// 		fail_num: 0,
// 		out_batch_no: 'TFN5DWLJ4IIFZC6IC3WC4KN2HV0WK7R2',
// 		success_amount: 50,
// 		success_num: 1,
// 		total_amount: 50,
// 		total_num: 1,
// 		update_time: '2022-06-03T14:05:09+08:00',
// 	},
// 	transfer_detail_list: [
// 		{
// 			detail_id: '1040000048801375938082022060300843063305',
// 			detail_status: 'SUCCESS',
// 			out_detail_no: 'K6J0BYJ3IMB4AMQ771BUYJQKDL30DI18',
// 		},
// 	],
// };

//

module.exports = {
	payForPeople: async ({ money, openid, username, out_detail_no }) => {
		const out_batch_no = ObjectUtil.getUuid();
		const body = {
			appid: config.wx_appid, // 直连商户的appid
			out_batch_no, // 商户系统内部的商家批次单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一
			batch_name: '演出费用', // 批次名称
			batch_remark: '演员的演出费用支付', // 批次备注
			total_amount: money, // 转账总金额
			total_num: 1, // 转账总笔数
			transfer_detail_list: [
				{
					out_detail_no, // 商户系统内部区分转账批次单下不同转账明细单的唯一标识
					transfer_amount: money, // 转账金额
					transfer_remark: '演出费用支付', // 转账备注
					openid, // 用户在直连商户应用下的用户标示
					// user_name: username, // 收款用户姓名 金额 > 2000 必传
				},
			],
		};
		const nonce_str = ObjectUtil.getRandomStr(); // 获取签名使用
		const timeStamp = parseInt(new Date().getTime() / 1000, 10);
		const signature = companyPay.getSignature('POST', nonce_str, timeStamp, '/v3/transfer/batches', body);
		const authorization = companyPay.getAuthorization(nonce_str, timeStamp, signature);
		const response = await fetch('https://api.mch.weixin.qq.com/v3/transfer/batches', {
			method: 'post',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				Authorization: authorization,
			},
		});
		const data = await response.json();
		console.log(data, 1111);
		// 支付成功返回
		// {
		// 	batch_id: '1030000048801375938082022060300844741378', // 微信批次单号
		// 	create_time: '2022-06-03T10:50:16+08:00', // 批次创建时间
		// 	out_batch_no: 'NNO5LF5YY720FD42IZI7ZWR3E7ZD0MH5', // 商家批次单号
		// };
		return data;
	},

	// 查询转账记录
	searchDetail: async ({ batch_id }) => {
		const nonce_str = ObjectUtil.getRandomStr();
		const timeStamp = parseInt(new Date().getTime() / 1000, 10);
		const urlPath = `/v3/transfer/batches/batch-id/${batch_id}?need_query_detail=true&offset=0&detail_status=ALL`;
		const url = `https://api.mch.weixin.qq.com${urlPath}`;
		console.log(url);
		const signature = companyPay.getSignature('GET', nonce_str, timeStamp, urlPath);
		const authorization = companyPay.getAuthorization(nonce_str, timeStamp, signature);
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: authorization,
			},
		});
		const data = await response.json();
		console.log(data, 111);
		return data;
	},
};
