const sequelize = require('./dataSource/MysqlPoolClass');
const config = require('./config/config');
const user = require('./models/user');

const userModal = user(sequelize);

let len = 10;

while (len > 0) {
	len -= 1;
	userModal
		.create({
			photo: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIV2tLze9RAUP9t4ibTHaAFeTcRsLr3CtqicaPvXU4e6k16oKeCIOgWJz1DML2FWv3gtGqoFGvr2vNg/132',
			phone: 18291312,
			wx_openid: '843jdfhj',
		})
		.then(() => {});
}
