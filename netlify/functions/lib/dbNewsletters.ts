const DB_NAME = './public/data/antrepriza.ldb';
const TABLE_NAME = 'newsletters';

const enum EMAIL_STATUS {
	ADDED = 0,
	CONFIRMED = 1,
	REMOVED = 2,
}

let db;

export type TAddEmailResult = {
	existed: boolean;
	obj: string;
	sid: number;
	confirmed: boolean;
	removed: boolean;
};

export class Newsletters {
	static openDatabase() {
		return;
	}

	static closeDatabase() {
		return;

		if (db) {
			db.close();
			db = undefined;
		}
	}

	static addNewEmail(lang: string, email: string): TAddEmailResult {
		return undefined;
	}

	static confirmEmail(obj: string, sid: number): boolean {
		return true;
	}

	static removeEmail(obj: string, usid: number): boolean {
		return true;
	}
}
