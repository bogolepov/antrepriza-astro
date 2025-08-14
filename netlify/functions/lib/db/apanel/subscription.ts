import { collection } from 'firebase/firestore';
import { query, getDocs } from '@firebase/firestore';
import { COLLECTION_THEATER, DOC_THEATER_SUBSCRIBERS, COLLECTION_SUBSCRIBERS_EMAILS } from '@netlify/lib/db/constsDB';
import type { TSubscriberPanel } from '@scripts/adminpanel/types/subscription';
import { antreprizaDB } from '../firebase';
import type { EmailDocDB } from '../typesDB';

export async function getSubscriptionsList(): Promise<TSubscriberPanel[]> {
	let emailDocs = await getDocs(
		query(collection(antreprizaDB, COLLECTION_THEATER, DOC_THEATER_SUBSCRIBERS, COLLECTION_SUBSCRIBERS_EMAILS))
	);

	const list: TSubscriberPanel[] = [];
	emailDocs.forEach(eDoc => {
		const data = eDoc.data() as EmailDocDB;
		list.push({ email: eDoc.id, state: data.state });
	});

	console.log(list);

	return list;
}
