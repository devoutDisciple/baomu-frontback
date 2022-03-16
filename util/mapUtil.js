const request = require('request');
const config = require('../config/config');

const getAddressByCode = ({ longitude, latitude }) => {
	return new Promise((resolve, reject) => {
		request.get(
			`${config.lbs_amap_url_address}?key=${config.libs_amap_key}&location=${longitude},${latitude}&poitype=&radius=&extensions=all&batch=false&roadlevel=0`,
			async (error, reee, body) => {
				if (error) {
					reject();
				}
				const result = JSON.parse(body);
				if (Number(result.status) === 1 && result.info === 'OK' && result.regeocode) {
					const { province, city } = result.regeocode.addressComponent;
					const { formatted_address } = result.regeocode;
					if (!province || !city || !formatted_address) reject();
					resolve({ province, city, formatted_address });
				} else {
					reject();
				}
			},
		);
	});
};

module.exports = {
	getAddressByCode,
};
