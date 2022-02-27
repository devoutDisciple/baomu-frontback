const config = require('../config/config');

module.exports = {
	getPhotoUrl: (name) => {
		if (!name) return '';
		if (name.includes('https://thirdwx.qlogo.cn')) {
			return name;
		}
		return config.preUrl.photoUrl + name;
	},
};
