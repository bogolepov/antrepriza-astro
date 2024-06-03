import Newsletters from './dbNewsletters';

function alwaysTrue() {
	return true;
}

module.exports = {
	NewslettersDB: Newsletters,
	alwaysTrue: alwaysTrue,
};
