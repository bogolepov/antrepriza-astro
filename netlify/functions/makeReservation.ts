import type { Handler } from '@netlify/functions';
import { LANG_LIST, EMAIL_REGEX, LANG_RU } from '@scripts/consts.ts';
import { fromHtmlToPlainText, makeHandlerResponse } from './lib/utils.ts';
import { makeHtmlEmail } from './lib/emails/mainEmailTemplate.ts';
import { makeContent, makeReservationsBlock } from './lib/emails/reservation.ts';
import {
	type EmailReservation,
	type ReservationsVariables,
	type TMail,
	TemplateNames,
	createTransporter,
	getEmailHtml,
	sendMail,
	sendMails,
} from './lib/mailService.ts';
import { addReservations, type TDoReservationExt } from './lib/db/makeReservationDB.ts';
import { DoReservationPacketSchema, type TDoReservationPacket } from '@scripts/types/reservation.ts';

import dictionaryServer from '@data/dictionary_server.json';
import dictionary from '@data/dictionary.json';
import theater from '@data/theater.json';
import plays from '@data/plays.json';
import prices from '@data/prices.json';
import afisha from '@data/afisha.json';
import { extractSchemaFromJson } from '@scripts/utils.ts';
import { getPlayName, needMarker } from '@scripts/play';
import { getHello } from './utils/time.ts';

type TMessageValidationResult = {
	valid: boolean;
	errCode: number;
	errMessage: string;
};

function makeEmailReservations(reservations: TDoReservationExt[], lang: string): EmailReservation[] {
	return reservations
		.map(reservation => {
			const play = plays.find(item => item.id === reservation.play_id); // play - thisPlay
			if (!play) return null;

			const eventDate = new Date(reservation.date).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: '2-digit' });
			const playName = getPlayName(play, lang).toUpperCase();
			const playLangMarker = needMarker(play, lang) ? play.lang_marker : undefined;
			const playDescription = `${play.genre[lang]}, ${play.age}, ${dictionaryServer.play_lang[play.lang_id][lang]}`;
			let stage = theater.stages.find(stg => stg.sid === reservation.stage_sid);
			const stageName = `${dictionaryServer.stage[lang]} - ${stage.name[lang].toUpperCase()}`;

			let totalAmount = 0;

			return {
				id: '#' + reservation.order_id,
				date: eventDate,
				time: reservation.time,
				event_name: playName,
				...(playLangMarker && { event_name_marker: playLangMarker }),
				event_description: playDescription,
				stage_name: stageName,
				stage_address: stage.address.full_address,
				tickets: reservation.tickets.map(ticket => {
					let ticketType = prices.find(price => price.type === ticket.type);
					totalAmount += ticketType.value * ticket.count;

					return {
						type: ticketType.text[lang],
						price: `${ticketType.value}€`,
						count: `${ticket.count}${dictionaryServer.lang_count[lang]}`,
						amount: `${ticketType.value * ticket.count}€`,
					};
				}),
				total_amount_label: dictionary.total_amount[lang],
				total_amount: `${totalAmount}€`,
			};
		})
		.filter(reservation => reservation !== null) as EmailReservation[];
}

export const handler: Handler = async (event, context) => {
	if (!event?.body) return makeHandlerResponse(400, dictionaryServer.nf__invalid_request[LANG_RU]);

	const packet: TDoReservationPacket = extractSchemaFromJson(DoReservationPacketSchema, event.body);
	if (!packet) return makeHandlerResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU]);

	// spam or not valid data checking
	const { valid, errCode, errMessage } = validateCart(packet);
	if (!valid) return makeHandlerResponse(errCode, errMessage);

	const { lang, name, email, amount, when } = packet;

	let extDoReservations: TDoReservationExt[] = packet.reservations as TDoReservationExt[];
	try {
		await addReservations(lang, name, email, when, extDoReservations);
	} catch (error) {
		console.error(error);
	}

	const subject = dictionaryServer.email_reservation_subject[lang];
	const emailReservations = makeEmailReservations(extDoReservations, lang);

	const getHtmlVariables = (toAntrepriza: boolean): ReservationsVariables => ({
		lang: lang,
		subject: subject,
		reservations: emailReservations,
		...(toAntrepriza && {
			theaterBlock: {
				main_text: dictionaryServer.new_reservation_text[lang],
				name_label: dictionaryServer.lang_name[lang],
				name: name,
				email_label: dictionaryServer.lang_email[lang],
				email: email,
				when_label: dictionaryServer.lang_when[lang],
				when: when,
			},
		}),
		...(!toAntrepriza && {
			userBlock: {
				hello:
					getHello(new Date(when).getHours(), lang) +
					(lang === LANG_RU ? ', ' : ' ') +
					fromHtmlToPlainText(name) +
					(lang === LANG_RU ? '!' : '.'),
				main_text: dictionaryServer.email_reservation_text[lang],
				location_text: dictionaryServer.email_reservation_where[lang],
				location_url_text: dictionaryServer.email_reservation_where_link_text[lang],
				note_list: dictionaryServer.email_reservation_note[lang],
				note_item1: dictionaryServer.email_reservation_note1[lang],
				note_item2: dictionaryServer.email_reservation_note2[lang],
				note_item3: dictionaryServer.email_reservation_note3[lang],
				reservation_introduce: dictionaryServer.email_reservation_introduce[lang],
				review_introduce: dictionaryServer.email_review_introduce[lang],
				review_introduce2: dictionaryServer.email_review_introduce2[lang],
				regards: dictionaryServer.email_reservation_welcome2[lang],
				team: theater.longTheaterName[lang],
			},
		}),
	});

	const { transporter, emailFrom, emailToAntrepriza } = createTransporter(process.env.ANTREPRIZA_EMAIL_TICKETS, lang);
	if (
		!(await sendMail(transporter, {
			from: emailFrom,
			to: email,
			subject: subject,
			html: getEmailHtml(TemplateNames.reservations, getHtmlVariables(false)),
		}))
	) {
		// TODO: remove reservation from DB if email sending failed
		return makeHandlerResponse(500, dictionaryServer.nf__reservations__error[lang]);
	} else {
		// Отправляем письмо Антрепризе только если письмо для клиента успешно отправлено
		// Результат отправки письма для Антрепризы не критичен, поэтому не обрабатываем
		// возможные ошибки при отправке письма для Антрепризы
		await sendMail(transporter, {
			from: emailFrom,
			to: emailToAntrepriza,
			subject: subject,
			html: getEmailHtml(TemplateNames.reservations, getHtmlVariables(true)),
		});
		return makeHandlerResponse(200, dictionaryServer.nf__reservations__ok[lang]);
	}

	/*
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
	*/
};

function validateCart(messageData: TDoReservationPacket): TMessageValidationResult {
	// if message structure is not valid (a fake message), then a fake OK-result
	const errResult: TMessageValidationResult = { valid: false, errCode: 200, errMessage: "'Email sent successfully'" };
	if (!messageData || !messageData.lang || !LANG_LIST.includes(messageData.lang)) return errResult;
	if (!messageData.name || messageData.name.length < 2) return errResult;
	if (!messageData.email || !EMAIL_REGEX.test(messageData.email) || messageData.email.length < 5 || messageData.email.length > 64)
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
			ev => ev.play_sid === play.suffix && ev.stage_sid === stage.sid && ev.date === element.date && ev.time === element.time,
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
