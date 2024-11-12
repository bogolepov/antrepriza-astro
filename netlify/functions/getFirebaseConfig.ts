import type { Handler } from '@netlify/functions';
import { firebaseConfig } from './lib/db/firebaseConfig';

export const handler: Handler = async (event, context) => {
	return {
		statusCode: 200,
		body: JSON.stringify({
			firebaseConfig: firebaseConfig,
		}),
	};
};
