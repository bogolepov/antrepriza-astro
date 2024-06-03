import Sqlite3 from 'better-sqlite3';
import fs from 'fs';

const ID_SHIFTS_ADD = { y: 347, m: 23, d: 56 };
const ID_SHIFTS_REMOVE = { y: 817, m: 66, d: 54 };
const DB_NAME = 'antrepriza.ldb';
const TABLE_NAME = 'newsletters';

const EMAIL_STATUS_ADDED = 0;
const EMAIL_STATUS_CONFIRMED = 1;
const EMAIL_STATUS_REMOVED = 2;

let db;

// console.log('openDatabase 1');
// // const db = new Sqlite3(DB_NAME, { verbose: console.log });
// const db = new Sqlite3(DB_NAME);
// console.log('openDatabase 2');

// const queryCreateTable = `
//       CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
//         id INTEGER PRIMARY KEY,
//         email STRING NOT NULL UNIQUE,
// 				lang STRING NOT NULL,
//         id_add INTEGER NOT NULL UNIQUE,
//         id_remove INTEGER NOT NULL UNIQUE,
//         status INTEGER DEFAULT 0,
// 				remove_counter INTEGER DEFAULT 0,
//         err_counter INTEGER DEFAULT 0
//       )`;
// console.log('openDatabase 3');
// const stmtCreateTable = db.prepare(queryCreateTable);
// console.log('openDatabase 4');
// const createTable = db.transaction(() => {
// 	console.log('openDatabase 6');
// 	let res = stmtCreateTable.run();
// 	console.log('result of create TABLE');
// 	console.log(res);
// });
// console.log('openDatabase 5');
// createTable();
// console.log('openDatabase 7');

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getIdAdd(currDate) {
	let strIdAdd =
		getRandomIntInclusive(1, 9).toString() +
		(currDate.getFullYear() - 2000 + ID_SHIFTS_ADD.y).toString() +
		getRandomIntInclusive(100, 999).toString() +
		(currDate.getMonth() + 1 + ID_SHIFTS_ADD.m).toString() +
		getRandomIntInclusive(10, 99).toString() +
		(currDate.getDate() + ID_SHIFTS_ADD.d).toString() +
		getRandomIntInclusive(1, 9).toString();
	return Number(strIdAdd);
}

function getIdRemove(currDate) {
	let strIdRemove =
		getRandomIntInclusive(10, 99).toString() +
		(currDate.getMonth() + 1 + ID_SHIFTS_REMOVE.m).toString() +
		getRandomIntInclusive(10, 99).toString() +
		(currDate.getFullYear() - 2000 + ID_SHIFTS_REMOVE.y).toString() +
		getRandomIntInclusive(100, 999).toString() +
		(currDate.getDate() + ID_SHIFTS_REMOVE.d).toString() +
		getRandomIntInclusive(1, 9).toString();
	return Number(strIdRemove);
}

class Newsletters {
	static openDatabase() {
		if (db) return;
		const testFolder = './';
		console.log('Newsletters.openDatabase(): scan all files in current directory...');
		fs.readdirSync(testFolder).forEach(file => {
			console.log(file);
		});
		console.log('...scanned');

		console.log('openDatabase 1');
		// db = new Sqlite3(DB_NAME, { verbose: console.log });
		db = new Sqlite3(DB_NAME, { verbose: console.log });
		console.log('openDatabase 2');

		const queryCreateTable = `
			CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
				id INTEGER PRIMARY KEY,
				email STRING NOT NULL UNIQUE,
				lang STRING NOT NULL,
				id_add INTEGER NOT NULL UNIQUE,
				id_remove INTEGER NOT NULL UNIQUE,
				status INTEGER DEFAULT 0,
				remove_counter INTEGER DEFAULT 0,
				err_counter INTEGER DEFAULT 0
			)`;
		console.log('openDatabase 3');
		const stmtCreateTable = db.prepare(queryCreateTable);
		console.log('openDatabase 4');
		const createTable = db.transaction(() => {
			console.log('openDatabase 6');
			let res = stmtCreateTable.run();
			console.log('result of create TABLE');
			console.log(res);
		});
		console.log('openDatabase 5');
		createTable();
		console.log('openDatabase 7');
	}

	static closeDatabase() {
		if (db) {
			db.close();
			db = undefined;
		}
	}

	static addNewEmail(lang, email) {
		console.log(email);
		if (!db) return { exists: false, sid: 0 };

		const existEmail = db.prepare(`SELECT * FROM ${TABLE_NAME} WHERE email = ?`).get(email);
		console.log('...check if email exists:');
		console.log(existEmail);

		// exists, but not removed from maillist
		if (existEmail && existEmail.status !== EMAIL_STATUS_REMOVED) {
			return { existed: true, sid: existEmail.id_add, confirmed: existEmail.status === EMAIL_STATUS_CONFIRMED, removed: false };
		}
		// exists and removed from maillist - we will reinitialize (added, not confirmed)
		else if (existEmail && existEmail.status === EMAIL_STATUS_REMOVED) {
			const stmtUpdateEmail = db.prepare(`UPDATE ${TABLE_NAME} SET lang = ?, status = ? WHERE email = ?`);
			const updateEmail = db.transaction((lang, email, status) => {
				let info = stmtUpdateEmail.run(lang, status, email);
				console.log('...reinitialize removed existed email:');
				console.log(info);
			});
			updateEmail(lang, existEmail.email, EMAIL_STATUS_ADDED);

			return { existed: true, sid: existEmail.id_add, confirmed: false, removed: false };
		}

		const currDate = new Date();
		const item = { email: email, lang: lang, id_add: getIdAdd(currDate), id_remove: getIdRemove(currDate) };
		console.log(item);

		const stmtAddEmail = db.prepare(
			`INSERT INTO ${TABLE_NAME} (email, lang, id_add, id_remove) VALUES (@email, @lang, @id_add, @id_remove)`
		);
		const addEmail = db.transaction(item => {
			let res = stmtAddEmail.run(item);
			console.log('...add email:');
			console.log(res);
			if (res.changes === 0) {
				let err = 'NOT ADDED email ' + item.email;
				console.error(err);
				throw new Error(err);
			}
		});
		try {
			addEmail(item);
		} catch {
			return { existed: false, sid: 0 };
		}

		return { existed: false, sid: item.id_add, confirmed: false, removed: false };
	}

	static confirmEmail(sid) {
		if (!db) return false;

		const stmtConfirmEmail = db.prepare(`UPDATE ${TABLE_NAME} SET status = ? WHERE id_add = ?`);
		const confirmEmail = db.transaction(sid => {
			let res = stmtConfirmEmail.run(EMAIL_STATUS_CONFIRMED, sid);
			console.log('...update email:');
			console.log(res);
			if (res.changes === 0) {
				let err = 'NO CHANGES at confirmation email with sid ' + sid;
				console.error(err);
				throw new Error(err);
			}
		});
		try {
			confirmEmail(sid);
		} catch {
			return false;
		}

		return true;
	}

	static removeEmail(usid) {
		if (!db) return false;

		const existsEmail = db.prepare(`SELECT * FROM ${TABLE_NAME} WHERE id_remove = ?`).get(usid);
		console.log(existsEmail);
		if (!existsEmail) {
			console.error('INVALID usid ' + usid);
			return false;
		} else if (existsEmail.status === EMAIL_STATUS_REMOVED) {
			return true;
		} else if (existsEmail.status === EMAIL_STATUS_CONFIRMED) {
			const stmtRemoveEmail = db.prepare(`UPDATE ${TABLE_NAME} SET status = ?, remove_counter = ? WHERE id_remove = ?`);
			const removeEmail = db.transaction(usid => {
				let res = stmtRemoveEmail.run(EMAIL_STATUS_REMOVED, existsEmail.remove_counter + 1, usid);
				console.log('...update removing email:');
				console.log(res);
				if (res.changes === 0) {
					let err = 'NO CHANGES at removing email with usid ' + usid;
					console.error(err);
					throw new Error(err);
				}
			});
			try {
				removeEmail(usid);
				return true;
			} catch {
				return false;
			}
		}

		console.log('a STRANGE situation at email removing...');
		return true;
	}
}

module.exports = Newsletters;
