// import Sqlite3 from 'better-sqlite3';

const ID_SHIFTS_ADD = { y: 347, m: 23, d: 56 };
const ID_SHIFTS_REMOVE = { y: 817, m: 66, d: 54 };
const DB_NAME = './public/data/antrepriza.ldb';
const TABLE_NAME = 'newsletters';

const enum EMAIL_STATUS {
	ADDED = 0,
	CONFIRMED = 1,
	REMOVED = 2,
}

let db;

function getRandomIntInclusive(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getIdAdd(currDate: Date): number {
	const strIdAdd: string =
		getRandomIntInclusive(1, 9).toString() +
		(currDate.getFullYear() - 2000 + ID_SHIFTS_ADD.y).toString() +
		getRandomIntInclusive(100, 999).toString() +
		(currDate.getMonth() + 1 + ID_SHIFTS_ADD.m).toString() +
		getRandomIntInclusive(10, 99).toString() +
		(currDate.getDate() + ID_SHIFTS_ADD.d).toString() +
		getRandomIntInclusive(1, 9).toString();
	return Number(strIdAdd);
}

function getIdRemove(currDate: Date): number {
	const strIdRemove: string =
		getRandomIntInclusive(10, 99).toString() +
		(currDate.getMonth() + 1 + ID_SHIFTS_REMOVE.m).toString() +
		getRandomIntInclusive(10, 99).toString() +
		(currDate.getFullYear() - 2000 + ID_SHIFTS_REMOVE.y).toString() +
		getRandomIntInclusive(100, 999).toString() +
		(currDate.getDate() + ID_SHIFTS_REMOVE.d).toString() +
		getRandomIntInclusive(1, 9).toString();
	return Number(strIdRemove);
}

export type TAddEmailResult = {
	existed: boolean;
	sid: number;
	confirmed: boolean;
	removed: boolean;
};

export class Newsletters {
	static openDatabase() {
		return;

		if (db) return;

		db = new Sqlite3(DB_NAME, { verbose: console.log });

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
		const stmtCreateTable = db.prepare(queryCreateTable);
		const createTable = db.transaction(() => {
			stmtCreateTable.run();
		});
		createTable();
	}

	static closeDatabase() {
		return;

		if (db) {
			db.close();
			db = undefined;
		}
	}

	static addNewEmail(lang: string, email: string): TAddEmailResult {
		const today: Date = new Date();
		return { existed: false, sid: getIdAdd(today), confirmed: false, removed: false };

		if (!db) return { existed: false, sid: 0, confirmed: false, removed: false };

		const existEmail = db.prepare(`SELECT * FROM ${TABLE_NAME} WHERE email = ?`).get(email);

		// exists, but not removed from maillist
		if (existEmail && existEmail.status !== EMAIL_STATUS.REMOVED) {
			return { existed: true, sid: existEmail.id_add, confirmed: existEmail.status === EMAIL_STATUS.CONFIRMED, removed: false };
		}
		// exists and removed from maillist - we will reinitialize (added, not confirmed)
		else if (existEmail && existEmail.status === EMAIL_STATUS.REMOVED) {
			const stmtUpdateEmail = db.prepare(`UPDATE ${TABLE_NAME} SET lang = ?, status = ? WHERE email = ?`);
			const updateEmail = db.transaction((lang, email, status) => {
				let info = stmtUpdateEmail.run(lang, status, email);
			});
			updateEmail(lang, existEmail.email, EMAIL_STATUS.ADDED);

			return { existed: true, sid: existEmail.id_add, confirmed: false, removed: false };
		}

		const currDate = new Date();
		const item = { email: email, lang: lang, id_add: getIdAdd(currDate), id_remove: getIdRemove(currDate) };

		const stmtAddEmail = db.prepare(
			`INSERT INTO ${TABLE_NAME} (email, lang, id_add, id_remove) VALUES (@email, @lang, @id_add, @id_remove)`
		);
		const addEmail = db.transaction(item => {
			let res = stmtAddEmail.run(item);
			if (res.changes === 0) {
				let err = 'NOT ADDED email ' + item.email;
				// console.error(err);
				throw new Error(err);
			}
		});
		try {
			addEmail(item);
		} catch {
			return { existed: false, sid: 0, confirmed: false, removed: false };
		}

		return { existed: false, sid: item.id_add, confirmed: false, removed: false };
	}

	static confirmEmail(sid: number): boolean {
		return true;

		if (!db) return false;

		const stmtConfirmEmail = db.prepare(`UPDATE ${TABLE_NAME} SET status = ? WHERE id_add = ?`);
		const confirmEmail = db.transaction(sid => {
			let res = stmtConfirmEmail.run(EMAIL_STATUS.CONFIRMED, sid);
			if (res.changes === 0) {
				let err = 'NO CHANGES at confirmation email with sid ' + sid;
				// console.error(err);
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

	static removeEmail(usid: number): boolean {
		return true;

		if (!db) return false;

		const existsEmail = db.prepare(`SELECT * FROM ${TABLE_NAME} WHERE id_remove = ?`).get(usid);
		if (!existsEmail) {
			return false;
		} else if (existsEmail.status === EMAIL_STATUS.REMOVED) {
			return true;
		} else if (existsEmail.status === EMAIL_STATUS.CONFIRMED) {
			const stmtRemoveEmail = db.prepare(`UPDATE ${TABLE_NAME} SET status = ?, remove_counter = ? WHERE id_remove = ?`);
			const removeEmail = db.transaction(usid => {
				let res = stmtRemoveEmail.run(EMAIL_STATUS.REMOVED, existsEmail.remove_counter + 1, usid);
				if (res.changes === 0) {
					let err = 'NO CHANGES at removing email with usid ' + usid;
					// console.error(err);
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

		// console.log('a STRANGE situation at email removing...');
		return true;
	}
}
