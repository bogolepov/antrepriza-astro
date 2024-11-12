import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

const firebase = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const firestore = getFirestore(firebase);
