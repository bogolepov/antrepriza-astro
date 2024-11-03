import type { Handler } from '@netlify/functions';
import { firebaseConfig } from './lib/firebaseConfig';

export const handler: Handler = async (event, context) => {
	console.log('SERVER');

	console.log(firebaseConfig);

	return {
		statusCode: 200,
		body: JSON.stringify({
			firebaseConfig: firebaseConfig,
		}),
	};
};
