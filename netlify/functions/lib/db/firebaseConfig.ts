export const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
	measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
