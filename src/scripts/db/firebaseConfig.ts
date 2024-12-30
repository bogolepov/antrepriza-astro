export type TFirebaseConfig = {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
	measurementId: string;
};

let firebaseConfig: TFirebaseConfig;

export function initFirebaseConfig(config: TFirebaseConfig) {
	if (!firebaseConfig) {
		firebaseConfig = config;
	}
}

export function getFirebaseConfig(handleConfig: (config: TFirebaseConfig) => void) {
	if (firebaseConfig) {
		handleConfig(firebaseConfig);
	} else {
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			// body: JSON.stringify({}),
		};

		let isOk: boolean;
		fetch('/.netlify/functions/getFirebaseConfig')
			.then(response => {
				isOk = response.ok;
				return response.json();
			})
			.then(data => {
				if (isOk && data && data.firebaseConfig) {
					firebaseConfig = data.firebaseConfig as TFirebaseConfig;
					handleConfig(firebaseConfig);
				} else throw new Error('BACKEND error');
			})
			.catch(error => {
				handleConfig(undefined);
			});
	}
}
