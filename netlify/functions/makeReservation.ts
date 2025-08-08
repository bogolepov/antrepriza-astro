import type { Handler } from '@netlify/functions';
import { LANG_LIST, EMAIL_REGEX } from '@scripts/consts.ts';
import { makeHandlerResponse } from './lib/utils.ts';
import { makeHtmlEmail } from './lib/emails/mainEmailTemplate.ts';
import { makeContent, makeReservationsBlock } from './lib/emails/reservation.ts';
import { type TMail, sendMails } from './lib/mailService.ts';
import { addReservations, type TDoReservationExt } from './lib/db/makeReservationDB.ts';
import { type TNetlifyDataReservations } from '@scripts/types/reservation.ts';

import dictionaryServer from '@data/dictionary_server.json';
import theater from '@data/theater.json';
import plays from '@data/plays.json';
import prices from '@data/prices.json';
import afisha from '@data/afisha.json';

type TMessageValidationResult = {
	valid: boolean;
	errCode: number;
	errMessage: string;
};

export const handler: Handler = async (event, context) => {
	const messageData: TNetlifyDataReservations = JSON.parse(event.body);

	// spam or not valid data checking
	const { valid, errCode, errMessage } = validateMessage(messageData);
	if (!valid) return makeHandlerResponse(errCode, errMessage);

	const { lang, name, email, reservations, amount, when } = messageData;

	let extDoReservations: TDoReservationExt[] = reservations as TDoReservationExt[];
	try {
		await addReservations(lang, name, email, when, extDoReservations);
	} catch (error) {
		console.error(error);
	}

	const subject = dictionaryServer.email_reservation_subject[lang];
	const transporterMail: string = process.env.ANTREPRIZA_EMAIL_TICKETS;

	const htmlReservations = makeReservationsBlock(lang, extDoReservations, amount);

	let clientMail: TMail = {
		to: email,
		subject: subject,
		html: makeHtmlEmail(lang, subject, makeContent(lang, name, email, htmlReservations, when, false)),
	};
	let antreprizaMail: TMail = {
		to: '',
		subject: subject,
		html: makeHtmlEmail(lang, subject, makeContent(lang, name, email, htmlReservations, when, true)),
	};

	const isSent = await sendMails(lang, transporterMail, clientMail, antreprizaMail);

	if (isSent) return makeHandlerResponse(200, dictionaryServer.nf__reservations__ok[lang]);
	else return makeHandlerResponse(500, dictionaryServer.nf__reservations__error[lang]);
};

function validateMessage(messageData: TNetlifyDataReservations): TMessageValidationResult {
	// if message structure is not valid (a fake message), then a fake OK-result
	const errResult: TMessageValidationResult = { valid: false, errCode: 200, errMessage: "'Email sent successfully'" };
	if (!messageData || !messageData.lang || !LANG_LIST.includes(messageData.lang)) return errResult;
	if (!messageData.name || messageData.name.length < 2) return errResult;
	if (
		!messageData.email ||
		!EMAIL_REGEX.test(messageData.email) ||
		messageData.email.length < 5 ||
		messageData.email.length > 64
	)
		return errResult;
	if (!messageData.amount || messageData.amount <= 0 || !messageData.when) return errResult;
	if (!messageData.reservations || messageData.reservations.length === 0) return errResult;

	let myAmount = 0;

	let valid = true;
	let soldOut = false;
	messageData.reservations.forEach(element => {
		if (!valid || soldOut) return;

		if (!element.date || !element.time) {
			valid = false;
			return;
		}

		let play = plays.find(item => item.suffix === element.play_sid);
		let stage = theater.stages.find(stg => stg.sid === element.stage_sid);
		if (!play || !stage) {
			valid = false;
			return;
		}

		let event = afisha.find(
			ev =>
				ev.play_sid === play.suffix &&
				ev.stage_sid === stage.sid &&
				ev.date === element.date &&
				ev.time === element.time
		);
		if (!event || !element.tickets || element.tickets.length === 0) {
			valid = false;
			return;
		}

		if (event.sold_out) {
			soldOut = true;
			return;
		}

		element.tickets.forEach(ticket => {
			if (!valid) return;
			if (ticket.count < 1) return;

			let ticketType = prices.find(price => price.type === ticket.type);
			if (!ticketType) {
				valid = false;
				return;
			}
			myAmount += ticket.count * ticketType.value;
		});
	});

	if (!valid) return errResult;
	if (valid && (myAmount != messageData.amount || soldOut)) {
		valid = false;
		errResult.errCode = 500;
		errResult.errMessage = dictionaryServer.err_reservation_reset_cart[messageData.lang];
		return errResult;
	}

	return { valid: true, errCode: 200, errMessage: null }; // 200 means OK, no error
}
