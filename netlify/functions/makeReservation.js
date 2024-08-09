import nodemailer from 'nodemailer';
import fs from 'fs';
import { LANG_LIST, EMAIL_REGEX } from './lib/consts.cjs';
import { fromHtmlToPlainText } from './lib/utils.cjs';
import { makeHtmlEmail } from './lib/emailUtils.cjs';

let dictionaryServer;
let theater;

export const handler = async (event, context) => {
	try {
		let data = fs.readFileSync('./public/data/dictionary_server.json');
		dictionaryServer = JSON.parse(data);

		data = fs.readFileSync('./public/data/theater.json');
		theater = JSON.parse(data);

		// console.log(dictionaryServer);
		// console.log(theater);
	} catch (error) {
		console.error(error);
	}

	// const transporter = nodemailer.createTransport({
	// 	service: 'gmail',
	// 	auth: {
	// 		user: process.env.ANTREPRIZA_TRANSPORT_EMAIL,
	// 		pass: process.env.ANTREPRIZA_TRANSPORT_PASSWORD,
	// 	},
	// });

	const transporter = nodemailer.createTransport({
		pool: true,
		host: process.env.ANTREPRIZA_SMTP_HOST,
		port: 465,
		secure: true, // use TLS
		auth: {
			user: process.env.ANTREPRIZA_EMAIL_TICKETS,
			pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
		},
	});

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
	const htmlEmailToClient = makeHtmlEmail(lang, subject, makeContent(lang, name, email, reservations, amount, now, false));
	const htmlEmailToAntrepriza = makeHtmlEmail(lang, subject, makeContent(lang, name, email, reservations, amount, now, true));

	const makeMailOptions = toAntrepriza => {
		let mailTo = email;
		if (toAntrepriza) {
			if (process.env.MODE === process.env.MODE_PRODUCTION) {
				mailTo = process.env.ANTREPRIZA_EMAIL_TICKETS + ', ' + process.env.ANTREPRIZA_EMAIL_MAMONTOV;
			} else {
				mailTo = process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;
			}
		}
		return {
			// from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_TRANSPORT_EMAIL}>`,
			from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL_TICKETS}>`,
			to: mailTo,
			subject: subject,
			html: toAntrepriza ? htmlEmailToAntrepriza : htmlEmailToClient,
		};
	};

	try {
		// console.log('call sendMail.......');

		// email for the client;
		// the result of sending is IMPORTANT
		await transporter.sendMail(makeMailOptions(false));
		// email for Antrepriza
		// the result of sending is NOT important,
		// because the reservations SHOULD BE save somewhere (TODO:)
		// transporter.sendMail(makeMailOptions(false), (err, result) => {
		// 	console.error(err);
		// });
		try {
			await transporter.sendMail(makeMailOptions(true));
		} catch (error) {}

		// console.log('result:');
		// console.log(info);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Email sent successfully',
			}),
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: error.message,
			}),
		};
	}
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
		console.log('Amount is not correct');
		valid = false;
	}

	return valid;
}

function makeContent(lang, name, email, reservations, amount, now, toAntrepriza) {
	return makePersonalMessage(lang, name, email, now, toAntrepriza) + makeReservationsBlock(lang, reservations, amount);
}

function makePersonalMessage(lang, name, email, now, toAntrepriza) {
	const dateOfReservation = new Date(now);
	// const offset = dateOfReservation.getTimezoneOffset();
	// dateOfReservation = new Date(dateOfReservation.getTime() - offset * 60 * 1000);

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
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 0 8px">${strCurrentDate}</td>\
</tr>\
`;
	} else {
		let getHello = hour => {
			if (hour < 6 && lang === 'ru') return dictionaryServer.hello[lang];
			else if (hour < 12) return dictionaryServer.good_morning[lang];
			else if (hour < 18) return dictionaryServer.good_afternoon[lang];
			else return dictionaryServer.good_evening[lang];
		};
		let strHello =
			getHello(dateOfReservation.getHours()) + (lang === 'ru' ? ', ' : ' ') + fromHtmlToPlainText(name) + (lang === 'ru' ? '!' : ',');

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
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 0 0 15px 20px">${dictionaryServer.email_reservation_note3[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 15px">${dictionaryServer.email_reservation_welcome[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6">${theater.longTheaterName[lang]}</td></tr>\
<tr><td style="line-height: 120%">\
<a href='${theater.our_website_link}/${lang}' style="line-height: 120%; color: #d6d6d6">${theater.our_website_text}</a>\
</td></tr>\
`;
	}

	return `\
<table border="0" cellpadding="0" role="presentation" style="width: 100%; margin: 0; padding: 0 0 15px 0; border-bottom: 1px solid #d6d6d6">\
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
<table border="0" cellspacing="0" role="presentation" style="width: 100%; margin: 0; padding: 15px 0 0 0"><tbody>\
${eventsRows}\
<tr><td colspan="2" style="padding: 0; border-top: 1px solid #d6d6d6"></td></tr>\
${totalAmountRow}\
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
