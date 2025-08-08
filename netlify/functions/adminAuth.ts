import type { Handler } from '@netlify/functions';
import { firebaseConfig } from './lib/db/firebaseConfig';
import { makeHandlerResponse } from './lib/utils';

export const handler: Handler = async (event, context) => {
	const authData = JSON.parse(event.body);

	if (
		authData.name &&
		authData.message &&
		authData.email &&
		authData.email === 'info@a.eu' &&
		((authData.name === process.env.FIREBASE_ADMIN_NAME && authData.message === process.env.FIREBASE_ADMIN_PASSWORD) ||
			(authData.name === process.env.FIREBASE_DEMO_NAME && authData.message === process.env.FIREBASE_DEMO_PASSWORD))
	)
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Successfully',
				demo: authData.name === process.env.FIREBASE_DEMO_NAME,
				firebaseConfig: firebaseConfig,
			}),
		};
	else return makeHandlerResponse(500, 'Internal Server Error');
};
