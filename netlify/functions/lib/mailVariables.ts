export type SubscriptionUserVariables = {
	lang: string;
	subject: string;
	previewSubject: string;
	hello: string;
	happy_text: string;
	verify_text: string;
	verify_url: string;
	buttonText: string;
	regards: string;
	team: string;
};
export type SubscriptionTheaterVariables = {
	email: string;
};
export type ContactFormVariables = {
	lang: string;
	subject: string;
	hello: string;
	main_text: string;
	timestamp?: string;
	team: string;
	topic_label: string;
	topic: string;
	name_label: string;
	name: string;
	email_label: string;
	email: string;
	message_label: string;
	message: string;
};

export type EmailReservation = {
	id: string;
	date: string;
	time: string;
	event_name: string;
	event_name_marker?: string;
	event_description: string;
	stage_name: string;
	stage_address: string;
	tickets: {
		type: string;
		price: string;
		count: string;
		amount: string;
	}[];
	total_amount_label: string;
	total_amount: string;
};

export type ReservationsVariables = {
	lang: string;
	subject: string;
	theaterBlock?: {
		main_text: string;
		name_label: string;
		name: string;
		email_label: string;
		email: string;
		when_label: string;
		when: string;
	};
	userBlock?: {
		hello: string;
		main_text: string;
		location_text: string;
		location_url_text: string;
		note_list: string;
		note_item1: string;
		note_item2: string;
		note_item3: string;
		reservation_introduce: string;
		review_introduce: string;
		review_introduce2: string;
		regards: string;
		team: string;
	};
	reservations: EmailReservation[];
};
