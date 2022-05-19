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
	Jimp.read(real_path, (err, lenna) => {
		if (err) throw err;
		lenna
			.resize(Jimp.AUTO, handle_size) // resize
			.quality(80) // set JPEG quality
			.writeAsync(real_path)
			.then(() => {
				const new_size = getSize(real_path);
				console.log(real_path, new_size);
				if (new_size > final_size) {
					dealImg(fileName, filePath, handle_size);
				}
			});
	});
};

const imgDeal = async (fileName, filePath) => {
	const real_path = `${filePath}/${fileName}`;
	const real_name = getName(fileName);
	const size = getSize(real_path);
	const mini_name = `${real_name}.jpg`;
	fs.copyFileSync(real_path, `${filePath}/${mini_name}`);
	if (size > final_size) {
		await dealImg(mini_name, filePath);
	}
};

module.exports = imgDeal;
