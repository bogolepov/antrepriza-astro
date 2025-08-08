import { collection } from 'firebase/firestore';
import { query, getDocs, where } from '@firebase/firestore';
import { COLLECTION_TICKETS } from '@netlify/lib/db/constsDB';
import { antreprizaDB } from '../firebase';
import type { TEventReservation, TNamedEventReservation } from '@scripts/types/reservation';

export async function getEventsReservationsList(): Promise<TNamedEventReservation[]> {
	const currDate = new Date();
	let eventsDocs = await getDocs(
		query(collection(antreprizaDB, COLLECTION_TICKETS), where('date', '>', (currDate.getFullYear() - 2).toString()))
	);

	const list: TNamedEventReservation[] = [];
	eventsDocs.forEach(eDoc => {
		const data = eDoc.data() as TEventReservation;
		list.push({ event_sid: eDoc.id, ...data });
	});
	return list;
}
