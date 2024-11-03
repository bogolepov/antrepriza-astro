import { initializeApp, type FirebaseApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { getFirebaseConfig, type TFirebaseConfig } from './firebaseConfig';
// import { getAnalytics } from 'firebase/analytics';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

let firebaseConfig: TFirebaseConfig;
let firebase: FirebaseApp;
// const analytics = getAnalytics(app);
let firestore: Firestore;

// const firebaseConfig = getFirebaseConfig();
// const firebase = initializeApp(firebaseConfig);
// // const analytics = getAnalytics(app);
// const firestore = getFirestore(firebase);

let handleResultConnect: (connected: boolean) => void;

function handleConfig(config: TFirebaseConfig): void {
	if (config) {
		firebaseConfig = config;
		firebase = initializeApp(firebaseConfig);
		firestore = getFirestore(firebase);
		console.log('firestore:');
		console.log(firestore);

		handleResultConnect(firestore != undefined);
	} else handleResultConnect(false);
	handleResultConnect = undefined;
}

export function dbConnect(handleResult: (connected: boolean) => void) {
	handleResultConnect = handleResult;
	getFirebaseConfig(handleConfig);
}
export function dbDisconnect(handleResult: (connected: boolean) => void) {
	firestore = undefined;
	firebase = undefined;
	firebaseConfig = undefined;
	handleResult(false);
}

export function getAntreprizaDB() {
	return firestore;
}
