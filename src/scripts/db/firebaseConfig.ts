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
		console.log('initFirebaseConfig:');

		console.log(firebaseConfig);
	}
}

// let firebaseConfig2: TFirebaseConfig;

// const firebaseConfig3 = {
// 	apiKey: 'AIzaSyDyMcxNhl03ss4u7hUg4MTVrHPnhDxD-N8',
// 	authDomain: 'antreprizaweb-9756b.firebaseapp.com',
// 	projectId: 'antreprizaweb-9756b',
// 	storageBucket: 'antreprizaweb-9756b.firebasestorage.app',
// 	messagingSenderId: '205810043255',
// 	appId: '1:205810043255:web:c86ab00f7c5e83a4e8f972',
// 	measurementId: 'G-51CX15JKKF',
// };

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
				console.log('netlify function: answer 1');

				isOk = response.ok;
				return response.json();
			})
			.then(data => {
				if (isOk && data && data.firebaseConfig) {
					firebaseConfig = data.firebaseConfig as TFirebaseConfig;
					console.log('firebaseConfig');
					console.log(firebaseConfig);
					handleConfig(firebaseConfig);
				} else throw new Error('BACKEND error');
			})
			.catch(error => {
				console.log(error);
				handleConfig(undefined);
			});
	}
}
