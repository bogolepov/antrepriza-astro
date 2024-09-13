import type { Handler } from '@netlify/functions';
import { LANG_LIST, EMAIL_REGEX } from './lib/consts.ts';
import { fromHtmlToPlainText, getJsonDictionary, getJsonTheater } from './lib/utils.ts';
import { makeHtmlEmail } from './lib/mailUtils.ts';
import { type TMail, sendMails } from './lib/mailService.ts';

let dictionaryServer;
let theater;

export const handler: Handler = async (event, context) => {
	dictionaryServer = getJsonDictionary();
	theater = getJsonTheater();
	if (!dictionaryServer || !theater) {
		console.error('JSON files are not found');
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: 'Internal Server Error',
			}),
		};
	}

	const messageData = JSON.parse(event.body);

	// spam checking
	if (!validateMessage(messageData)) {
		// fake OK-result
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Email sent successfully',
			}),
		};
	}

	const { lang, name, email, reservations, amount, now } = messageData;

	const subject = dictionaryServer.email_reservation_subject[lang];
	const transporterMail: string = process.env.ANTREPRIZA_EMAIL_TICKETS;

	let clientMail: TMail = {
		to: email,
		subject: subject,
		html: makeHtmlEmail(lang, subject, makeContent(lang, name, email, reservations, amount, now, false)),
	};
	let antreprizaMail: TMail = {
		to: '',
		subject: subject,
		html: makeHtmlEmail(lang, subject, makeContent(lang, name, email, reservations, amount, now, true)),
	};

	return await sendMails(lang, transporterMail, clientMail, antreprizaMail);
};

function validateMessage(messageData) {
	if (!messageData || !messageData.lang || !LANG_LIST.includes(messageData.lang)) return false;
	if (!messageData.name || messageData.name.length < 2) return false;
	if (!messageData.email || !EMAIL_REGEX.test(messageData.email) || messageData.email.length < 5 || messageData.email.length > 64)
		return false;
	if (messageData.amount <= 0 || messageData.now <= 0) return false;
	if (!messageData.reservations || messageData.reservations.length === 0) return false;

	let myAmount = 0;

	let valid = true;
	messageData.reservations.forEach(element => {
		if (!valid) return;

		if (!element.date || !element.time) {
			valid = false;
			return;
		}

		let play = theater.plays.find(item => item.id === element.play_id);
		let playDate = new Date(element.date);
		let stage = theater.stages.find(stg => stg.sid === element.stage_sid);
		if (!play || !playDate || !stage || !element.tickets || element.tickets.length === 0) {
			valid = false;
			return;
		}

		element.tickets.forEach(ticket => {
			if (!valid) return;
			if (ticket.count < 1) return;

			let ticketType = theater.prices.find(price => price.type === ticket.type);
			if (!ticketType) {
				valid = false;
				return;
			}
			myAmount += ticket.count * ticketType.value;
		});
	});

	if (valid && myAmount != messageData.amount) {
		// console.log('Amount is not correct');
		valid = false;
	}

	return valid;
}

function makeContent(lang, name, email, reservations, amount, now, toAntrepriza) {
	const dateOfReservation = new Date(now);
	// const offset = dateOfReservation.getTimezoneOffset();
	// dateOfReservation = new Date(dateOfReservation.getTime() - offset * 60 * 1000);

	const htmlReservation = makeReservationsBlock(lang, reservations, amount);

	let diffText;

	if (toAntrepriza) {
		let options = {
			year: 'numeric',
			month: 'long',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		};
		let strCurrentDate = dateOfReservation.toLocaleDateString(lang, options);

		diffText = `\
<tr><td colspan="2" style="font-size: 125%; padding-bottom: 15px; line-height: 120%; color: #d6d6d6; font-weight: 500">\
${dictionaryServer.new_reservation_text[lang]}\
</td></tr>\
<tr>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top">${dictionaryServer.lang_name[lang]} :</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 5px 8px">${fromHtmlToPlainText(name)}</td>\
</tr>\
<tr>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top">Email :</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 5px 8px">
<a href='${'mailto:' + fromHtmlToPlainText(email)}' style="line-height: 120%; color: #d6d6d6">${fromHtmlToPlainText(email)}</a></td>\
</tr>\
<tr>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top">${dictionaryServer.lang_when[lang]} :</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 15px 8px">${strCurrentDate}</td>\
</tr>\
<tr><td colspan="2">${htmlReservation}</td></tr>\
`;
	} else {
		const getHello = hour => {
			if (hour < 6 && lang === 'ru') return dictionaryServer.hello[lang];
			else if (hour < 12) return dictionaryServer.good_morning[lang];
			else if (hour < 18) return dictionaryServer.good_afternoon[lang];
			else return dictionaryServer.good_evening[lang];
		};
		const strHello =
			getHello(dateOfReservation.getHours()) + (lang === 'ru' ? ', ' : ' ') + fromHtmlToPlainText(name) + (lang === 'ru' ? '!' : '.');
		const strWelcome1_WithLinks = makeLinks(dictionaryServer.email_reservation_welcome1[lang]);

		diffText = `\
<tr><td style="font-size: 125%; padding-bottom: 15px; line-height: 120%; color: #d6d6d6; font-weight: 500">${strHello}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 15px">${dictionaryServer.email_reservation_text[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 15px">\
${dictionaryServer.email_reservation_where[lang]}&ensp;\
<a href="https://antrepriza.eu/${lang}/theater/contact/" style="line-height: 120%; color: #87605e; font-weight: 700">\
${dictionaryServer.email_reservation_where_link_text[lang]}</a>.\
</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 3px">${dictionaryServer.email_reservation_note[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 0 0 3px 20px">${dictionaryServer.email_reservation_note1[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 0 0 3px 20px">${dictionaryServer.email_reservation_note2[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 0 0 20px 20px">${dictionaryServer.email_reservation_note3[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 5px">${dictionaryServer.email_reservation_note4[lang]}</td></tr>\
<tr><td>${htmlReservation}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 20px 0 15px 0">${strWelcome1_WithLinks}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 0 0 15px 0">${dictionaryServer.email_reservation_welcome2[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6">${theater.longTheaterName[lang]}</td></tr>\
<tr><td style="line-height: 120%">\
<a href='${theater.our_website_link}/${lang}' style="line-height: 120%; color: #d6d6d6">${theater.our_website_text}</a>\
</td></tr>\
`;
	}

	return `\
<table border="0" cellpadding="0" role="presentation" style="width: 100%; margin: 0; padding: 0 0 15px 0">\
<tbody>\
${diffText}\
</tbody>\
</table>\
`;
}

let reservationsBlock;
function makeReservationsBlock(lang, reservations, amount) {
	if (reservationsBlock) return reservationsBlock;
	// console.log(reservations);

	const eventsRows = makeEventsRows(lang, reservations);
	const totalAmountRow = '';
	// 	totalAmountRow = `\
	// <tr>\
	// <td style="font-size: 130%; line-height: 120%; color: #d6d6d6; padding: 8px 0 0 0">${dictionaryServer.total_amount[lang]}</td>\
	// <td style="font-size: 130%; line-height: 120%; color: #d6d6d6; padding: 8px 15px 0 0; text-align: right">${amount}€</td>\
	// </tr>\
	// `;

	reservationsBlock = `\
<table border="0" cellspacing="0" role="presentation" style="width: 100%; margin: 0; padding: 15px 0 0 0; \
border-top: 1px solid #d6d6d6; border-bottom: 1px solid #d6d6d6"><tbody>\
${eventsRows}\
</tbody></table>\
`;

	return reservationsBlock;
}

function makeEventsRows(lang, reservations) {
	if (!reservations) return;

	let rows = '';
	reservations.forEach(event => {
		let play = theater.plays.find(item => item.id === event.play_id); // play - thisPlay
		let playName = play.title[lang];
		let playDate = new Date(event.date);
		let options = {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
		};
		let strDate = playDate.toLocaleDateString(lang, options);

		let stage = theater.stages.find(stg => stg.sid === event.stage_sid);
		let ticketsRows = makeTicketsRows(lang, event.tickets);
		if (!ticketsRows || !ticketsRows.amount || !ticketsRows.html) return;

		rows =
			rows +
			`\
<tr><td style="vertical-align: top">\
<table border="0" cellspacing="0" role="presentation" style="width: 100%; margin: 0; padding: 0"><tbody>\
<tr><td style="font-size: 115%; line-height: 120%; color: #87605e; font-weight: 600">${strDate}</td></tr>\
<tr><td style="font-size: 115%; line-height: 120%; color: #87605e; font-weight: 600">${event.time}</td></tr>\
</tbody></table>\
</td>\
<td style="vertical-align: top">\
<table border="0" cellspacing="0" role="presentation" style="width: 100%; margin: 0; padding: 0 0 12px 0"><tbody>\
<tr><td style="font-size: 180%; line-height: 110%; color: #d6d6d6; font-weight: 600">${playName.toUpperCase()}</td></tr>\
<tr><td style="font-size: 110%; line-height: 120%; color: #d6d6d6; font-weight: 300; padding: 0 0 4px 0">\
${play.genre[lang]}, ${play.age}, ${dictionaryServer.play_lang[play.lang_id][lang]}\
</td></tr>\
<tr><td>\
<table border="0" role="presentation" style=" width: 100%; padding: 5px 0 10px 15px; margin: 0; border-spacing: 12px 0; text-align: right; color: #888888;"><tbody>\
${ticketsRows.html}\
<tr><td colspan="4" style="padding-top: 2px; border-bottom: 1px solid #888888"></td></tr>\
<tr>\
<td colspan="2" style="padding-top: 3px; text-align: left; vertical-align: top; color: #888888">${dictionaryServer.total_amount[lang]}</td>\
<td colspan="2" style="padding-top: 3px; vertical-align: top; color: #888888">${ticketsRows.amount}€</td>\
</tr>\
</tbody>\
</table>\
</td></tr>\
<tr><td style="font-size: 110%; line-height: 120%; color: #d6d6d6; font-weight: 700">\
${dictionaryServer.stage[lang]} - ${stage.name[lang].toUpperCase()}\
</td></tr>\
<tr><td style="font-size: 110%; line-height: 120%; color: #888888">${stage.address.full_string}</td></tr>\
</tbody>\
</table>\
</td></tr>\
`;
	});
	return rows;
}

function makeTicketsRows(lang, tickets) {
	if (!tickets) return;

	let ticketsRows = '';
	let amount = 0;

	tickets.forEach(ticket => {
		if (ticket.count < 1) return;

		let ticketType = theater.prices.find(price => price.type === ticket.type);
		amount += ticketType.value * ticket.count;
		ticketsRows =
			ticketsRows +
			`\
<tr>\
<td style="line-height: 110%; text-align: left; vertical-align: top; color: #888888">${ticketType.text[lang]}</td>\
<td style="vertical-align: top; color: #888888">${ticketType.value}€</td>\
<td style="vertical-align: top; color: #888888">${ticket.count}${dictionaryServer.lang_count[lang]}</td>\
<td style="vertical-align: top; color: #888888">${ticketType.value * ticket.count}€</td>\
</tr>\
`;
	});

	return { amount: amount, html: ticketsRows };
}

function makeLinks(text) {
	if (text) {
		theater.review_links.forEach(item => {
			text = text.replace(
				`%${item.name}`,
				`<a href='${item.link}' style="line-height: 120%; color: #87605e; font-weight: 700">${item.name}</a>`
			);
		});
	}
	return text;
}
