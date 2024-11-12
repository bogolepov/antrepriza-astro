type TTicketInfo = {
	count: number;
	type: string;
};

type TReservation = {
	date: string;
	time: string;
	play_id: number;
	stage_sid: string;
	tickets: TTicketInfo[];
	order_id: string;
};
