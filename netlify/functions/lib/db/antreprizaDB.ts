import { firestore } from './firebase';
import { collection, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getCountFromServer, query, documentId, where } from '@firebase/firestore';
import { onlyNumbers, getRandomIntInclusive } from '../utils';

const ROOT_COLLECTION_TICKETS: string = 'tickets';

type TPlayReservation = {
	name: string;
	email: string;
	lang: string;
	tickets: TTicketInfo[];
	order_id: string;
};

function makeReservationId(date: string, time: string) {
	return date.slice(5, 7) + date.slice(8) + time.slice(0, 2) + getRandomIntInclusive(4179, 9378).toString();
}
async function eventInTicketsExists(eventName: string): Promise<boolean> {
	const snap = await getCountFromServer(query(collection(firestore, ROOT_COLLECTION_TICKETS), where(documentId(), '==', eventName)));
	return !!snap.data().count;
}

export async function addReservations(lang: string, name: string, email: string, reservations: TReservation[]) {
	if (reservations?.length > 0) {
		for (let event of reservations) {
			const eventDocName = `${event.stage_sid}_${onlyNumbers(event.date)}_${onlyNumbers(event.time)}`;
			event.order_id = makeReservationId(event.date, event.time);
			const reservation: TPlayReservation = {
				name: name,
				email: email,
				lang: lang,
				order_id: event.order_id,
				tickets: [],
			};
			reservation.tickets = event.tickets.filter(ticket => ticket.count > 0);

			if (await eventInTicketsExists(eventDocName)) {
				await updateDoc(doc(firestore, ROOT_COLLECTION_TICKETS, eventDocName), { spectators: arrayUnion(reservation) });
			} else {
				await setDoc(doc(firestore, ROOT_COLLECTION_TICKETS, eventDocName), { spectators: arrayUnion(reservation) });
			}
		}
	}
}
