import { antreprizaDB } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { query, documentId, where, getDocs } from '@firebase/firestore';
import { COLLECTION_THEATER, DOC_THEATER_SUBSCRIBERS, COLLECTION_SUBSCRIBERS_EMAILS } from '@netlify/lib/db/constsDB';
import { getRandomIntInclusive, getCRC32 } from '@scripts/utils';

import { ESubscriptionState, SUBSCRIPTION_OBJ_LENGTH, type TSubscriber } from '@scripts/types/subscription';
import type { EmailDocDB } from './typesDB';

export const enum ESubscriptionError {
	NO_ERROR,
	ERR_INVALID_PARAMS,
	ERR_USER_NOT_FOUND,
}

export type TSubscriptionResult = {
	subscriber: TSubscriber;
	error: ESubscriptionError;
};

const ID_SHIFTS_ADD = { y: 347, m: 23, d: 56 };
const ID_SHIFTS_REMOVE = { y: 817, m: 66, d: 54 };

function createObj(currDate: Date, email: string): string {
	let obj: string = currDate.getTime().toString(16) + getCRC32(email);
	if (obj.length > SUBSCRIPTION_OBJ_LENGTH) return obj.slice(0, SUBSCRIPTION_OBJ_LENGTH);
	else if (obj.length < SUBSCRIPTION_OBJ_LENGTH) return obj.padEnd(SUBSCRIPTION_OBJ_LENGTH - obj.length, 'f');
	else return obj;
}

function createSID(currDate: Date): number {
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

function getDateFromSID(sid: number): Date | undefined {
	const strSID = sid.toString();
	const SID_REGEX = /^[0-9]{14}$/;
	if (!SID_REGEX.test(strSID)) return undefined;

	const y = Number(strSID.slice(1, 4)) - ID_SHIFTS_ADD.y + 2000;
	const m = Number(strSID.slice(7, 9)) - ID_SHIFTS_ADD.m;
	const d = Number(strSID.slice(11, 13)) - ID_SHIFTS_ADD.d;

	const toN2 = (n: number) => n.toString().padStart(2, '0');
	const strDate = `${y}-${toN2(m)}-${toN2(d)}T12:00Z`;
	return new Date(strDate);
}

function createUSID(currDate: Date): number {
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

export async function registerEmail(email: string, lang: string): Promise<TSubscriptionResult> {
	email = email.toLocaleLowerCase();

	let userDocs = await getDocs(
		query(
			collection(antreprizaDB, COLLECTION_THEATER, DOC_THEATER_SUBSCRIBERS, COLLECTION_SUBSCRIBERS_EMAILS),
			where(documentId(), '==', email)
		)
	);
	if (userDocs.size > 1) console.error('DB: duplicated subscribers!');

	const date = new Date();
	let emailDoc: EmailDocDB = {
		lang,
		obj: createObj(date, email),
		sid: createSID(date),
		usid: createUSID(date),
		state: ESubscriptionState.REG_INIT,
	};

	let oldEmailDoc: EmailDocDB;
	if (userDocs.size) {
		oldEmailDoc = userDocs.docs[0].data() as EmailDocDB;
		const { state, sid, usid, obj } = oldEmailDoc;
		if (state === ESubscriptionState.REG_CONFIRM) emailDoc.state = ESubscriptionState.REG_CONFIRM;
		if (sid && usid && obj.length === SUBSCRIPTION_OBJ_LENGTH) {
			emailDoc.obj = obj;
			emailDoc.sid = sid;
			emailDoc.usid = usid;
		}
	}

	const { obj, sid, usid, state } = emailDoc;
	const result: TSubscriptionResult = {
		subscriber: { email, lang, obj, sid, usid, state },
		error: ESubscriptionError.NO_ERROR,
	};
	if (!oldEmailDoc || JSON.stringify(oldEmailDoc) !== JSON.stringify(emailDoc)) {
		await setDoc(
			doc(antreprizaDB, COLLECTION_THEATER, DOC_THEATER_SUBSCRIBERS, COLLECTION_SUBSCRIBERS_EMAILS, email),
			emailDoc
		);
	}

	return result;
}

export async function confirmEmail(obj: string, sid: number): Promise<TSubscriptionResult> {
	return await updateState(obj, sid, ESubscriptionState.REG_CONFIRM);
}

export async function deleteEmail(obj: string, usid: number): Promise<TSubscriptionResult> {
	return await updateState(obj, usid, ESubscriptionState.REG_DELETE);
}

async function updateState(
	obj: string,
	id: number,
	state: ESubscriptionState.REG_CONFIRM | ESubscriptionState.REG_DELETE
): Promise<TSubscriptionResult> {
	if (!obj || obj.length !== SUBSCRIPTION_OBJ_LENGTH || !id)
		return { subscriber: undefined, error: ESubscriptionError.ERR_INVALID_PARAMS };

	let userDocs = await getDocs(
		query(
			collection(antreprizaDB, COLLECTION_THEATER, DOC_THEATER_SUBSCRIBERS, COLLECTION_SUBSCRIBERS_EMAILS),
			where('obj', '==', obj)
		)
	);

	const docs = userDocs.docs.filter(item => {
		let itemData = userDocs.docs[0].data() as EmailDocDB;
		return id === (state === ESubscriptionState.REG_CONFIRM ? itemData.sid : itemData.usid);
	});

	if (docs.length > 1) console.error('DB: duplicated subscribers! [2]');
	if (!docs.length) return { subscriber: undefined, error: ESubscriptionError.ERR_USER_NOT_FOUND };

	let emailDoc = docs[0].data() as EmailDocDB;
	const email = docs[0].id;

	emailDoc.state = state;
	if (state === ESubscriptionState.REG_CONFIRM && !emailDoc.usid) emailDoc.usid = createUSID(getDateFromSID(id));

	await setDoc(
		doc(antreprizaDB, COLLECTION_THEATER, DOC_THEATER_SUBSCRIBERS, COLLECTION_SUBSCRIBERS_EMAILS, email),
		emailDoc
	);

	const { lang, sid, usid } = emailDoc;
	const result: TSubscriptionResult = {
		subscriber: { email, lang, obj, sid, usid, state },
		error: ESubscriptionError.NO_ERROR,
	};

	return result;
}
