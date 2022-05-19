const Jimp = require('jimp');
const fs = require('fs');

const getName = (fileName) => fileName.split('.')[0];
const final_size = 200 * 1024;
const orgin_size = 1000;
const getSize = (file) => fs.statSync(file).size;

const dealImg = (fileName, filePath, handle_size) => {
	if (!handle_size) handle_size = orgin_size;
	const real_path = `${filePath}/${fileName}`;
	handle_size -= 100;
	console.log('real_path: ', real_path);
	Jimp.read(real_path, (err, lenna) => {
		if (err) console.log(err);
		lenna
			.resize(Jimp.AUTO, handle_size) // resize
			.quality(80) // set JPEG quality
			.writeAsync(real_path)
			.then(() => {
				const new_size = getSize(real_path);
				console.log('new_size: ', new_size);
				if (new_size > final_size) {
					console.log('再次循环');
					dealImg(fileName, filePath, handle_size);
				}
			});
	});
};

const imgDeal = async (fileName, filePath) => {
	setTimeout(async () => {
		const real_path = `${filePath}/${fileName}`;
		const real_name = getName(fileName);
		const size = getSize(real_path);
		console.log('origin_size: ', size);
		const mini_name = `${real_name}.jpg`;
		if (size > final_size) {
			console.log('开始处理-----');
			dealImg(mini_name, filePath);
		}
	}, 3000);
};

module.exports = imgDeal;
