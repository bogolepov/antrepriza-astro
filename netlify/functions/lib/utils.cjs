module.exports.fromHtmlToPlainText = function (str) {
	if (str) {
		str = str.replaceAll('<', '&lt;');
		str = str.replaceAll('>', '&gt;');
	}
	return str;
};

module.exports.nonBreakingSpace = function (str) {
	if (str) {
		str = str.replaceAll(' ', '&nbsp;');
	}
	return str;
};

// module.exports = {
// 	fromHtmlToPlainText: fromHtmlToPlainText,
// };