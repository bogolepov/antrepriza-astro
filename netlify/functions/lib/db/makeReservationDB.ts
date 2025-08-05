import { antreprizaDB } from './firebase';
import { collection, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getCountFromServer, query, documentId, where } from '@firebase/firestore';
import type { TReservation, TOrderItem } from '@scripts/types/reservation';
import type { TReservationDB } from '@scripts/db/baseTypes';
import { COLLECTION_TICKETS } from '@scripts/db/antreprizaDB';
import { onlyNumbers, getRandomIntInclusive } from '@scripts/utils';

export type TReservationExt = TReservation & {
	order_id: string;
};

function makeReservationId(date: string, time: string) {
	return date.slice(5, 7) + date.slice(8) + time.slice(0, 2) + getRandomIntInclusive(4179, 9378).toString();
}
async function eventInTicketsExists(eventName: string): Promise<boolean> {
	const snap = await getCountFromServer(
		query(collection(antreprizaDB, COLLECTION_TICKETS), where(documentId(), '==', eventName))
	);
	return snap.data().count > 0;
}

export async function addReservations(
	lang: string,
	name: string,
	email: string,
	when: string,
	reservations: TReservationExt[]
) {
	if (reservations?.length > 0) {
		for (let event of reservations) {
			const eventDocName = `${event.stage_sid}_${onlyNumbers(event.date)}_${onlyNumbers(event.time)}_${event.play_sid}`;
			event.order_id = makeReservationId(event.date, event.time);
			const reservation: TReservationDB = {
				name: name,
				email: email,
				lang: lang,
				order_id: event.order_id,
				when: when,
				tickets: [],
			};
			reservation.tickets = event.tickets.filter(ticket => ticket.count > 0);

			if (await eventInTicketsExists(eventDocName)) {
				await updateDoc(doc(antreprizaDB, COLLECTION_TICKETS, eventDocName), { reservations: arrayUnion(reservation) });
			} else {
				await setDoc(doc(antreprizaDB, COLLECTION_TICKETS, eventDocName), { reservations: arrayUnion(reservation) });
			}
		}
	}
}
