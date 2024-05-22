import nodemailer from 'nodemailer';
import fs from 'fs';

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
		console.log('error:');
		console.error(error);
	}

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.ANTREPRIZA_EMAIL,
			pass: process.env.ANTREPRIZA_PASSWORD,
		},
	});

	const messageData = JSON.parse(event.body);
	const { lang, name, email, reservations, amount } = messageData;

	let htmlHead, htmlReservationsTable;
	const htmlEmailToClient = makeHtmlEmail(true, lang, name, email, reservations, amount);
	const htmlEmailToAntrepriza = makeHtmlEmail(false, lang, name, email, reservations, amount);

	const makeMailOptions = isForClient => {
		return {
			from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL}>`,
			to: isForClient ? email : process.env.ANTREPRIZA_TICKETS_EMAIL,
			subject: `${dictionaryServer.email_ticket_subject[lang]}`,
			// text: `Hello, ${name}!`,
			html: isForClient ? htmlEmailToClient : htmlEmailToAntrepriza,
		};
	};

	try {
		// console.log('call sendMail.......');

		// email for the client;
		// the result of sending is IMPORTANT
		await transporter.sendMail(makeMailOptions(true));
		// email for Antrepriza
		// the result of sending is NOT important,
		// because the reservations were added to database
		transporter.sendMail(makeMailOptions(false), (err, result) => {
			console.error(err);
		});

		// await transporter.sendMail(makeMailOptions(false));

		// console.log('result:');
		// console.log(info);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Email sent successfully',
			}),
		};
	} catch (error) {
		console.log('error:');
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: error.message,
			}),
		};
	}

	function makeHtmlEmail(isForClient, lang, name, email, reservations, amount) {
		return (
			`<!DOCTYPE html><html lang="${lang}">` + makeHead(lang) + makeBody(isForClient, lang, name, email, reservations, amount) + `</html>`
		);
	}

	function makeHead(lang) {
		if (!!htmlHead) return htmlHead;

		htmlHead =
			'<head><meta charset="UTF-8"><title>' +
			theater.shortTheaterName[lang] +
			' - ' +
			dictionaryServer.email_ticket_subject[lang] +
			'</title><style>' +
			'table {border-spacing:0;} td {vertical-align:top;}' +
			'.email-body {font-size:16px;background-color:#292929;color:#d6d6d6;}' +
			'.email-body a {color:#d6d6d6;} .email-body .im * {color:#d6d6d6;}' +
			'.body-table {width:100%;}' +
			'.email-wrapper {padding:2rem;margin-left:auto;margin-right:auto;} ' +
			'.reservation-titel {font-size:1.35rem;margin-bottom:15px;line-height:1.2em;}' +
			'.lh12 {line-height:1.2em;} .b700 {font-weight:700;}' +
			'.user-table {margin-bottom:15px;}' +
			'.user-table tr td {min-width:5em;}' +
			'.play-table {width:100%;border-top:1px solid;border-spacing:0 25px;}' +
			'.play-titel {font-weight:700;font-size:1.8rem;line-height:1.1em;}' +
			'.play-date {color:#87605e;font-weight:700;font-size:1.1rem;padding-bottom:0.1em;line-height:1.2em;margin-right:18px;}' +
			'.play-info {font-size:1.1rem; font-weight:300;line-height:1.2em;padding-bottom:0.25em;}' +
			'.tickets-table {width:100%;border-spacing:12px 0;margin-bottom:10px;margin-top:5px;text-align:right;color:#888888;}' +
			'.tickets-table * {line-height:1.2em;}' +
			'.tickets-name {min-width:140px;text-align:left;padding-left:15px;}' +
			'.left0 {padding-left:0;}' +
			'.tickets-count {min-width:45px;} .tickets-amount {min-width:55px;}' +
			'.play-amount-border {border-top:1px solid;margin-left:15px;}' +
			'.total-amount {font-size:1.3rem;line-height:1.2em;padding-top:0.5em;border-top:1px solid;}' +
			'.td-right {text-align:right;} .td-right .total-amount {padding-right:15px;}' +
			'.address {font-size:1.1rem; line-height:1.2em;}' +
			'</style></head>';

		return htmlHead;
	}

	function makeBody(isForClient, lang, name, email, reservations, amount) {
		return (
			`<body class='email-body'><table class='body-table'><tbody><tr><td class='email-wrapper'>` +
			makeTextAboutReservation(isForClient, lang, name, email) +
			makeReservationsTable(lang, reservations, amount) +
			`</td></tr></tbody></table></body>`
		);
	}

	function makeTextAboutReservation(isForClient, lang, name, email) {
		let dateOfReservation = new Date(Date.now());
		if (isForClient) {
			let getHello = hour => {
				if (hour < 6 && lang === 'ru') return dictionaryServer.hello[lang];
				else if (hour < 12) return dictionaryServer.good_morning[lang];
				else if (hour < 18) return dictionaryServer.good_afternoon[lang];
				else return dictionaryServer.good_evening[lang];
			};
			let strHello = getHello(dateOfReservation.getHours()) + (lang === 'ru' ? ', ' : ' ') + name + (lang === 'ru' ? '!' : ',');

			return (
				`<div class='reservation-titel b700'>${strHello}</div>` +
				`<p class='lh12'>${dictionaryServer.email_reservation_text[lang]}</p>` +
				`<p class='lh12'>${dictionaryServer.email_reservation_text2[lang]}</p>` +
				`<p class='lh12'>${dictionaryServer.email_reservation_text3[lang]}</p>` +
				`<p><div class='lh12'>${dictionaryServer.email_reservation_text4[lang]}</div>` +
				`<div class='lh12'>${theater.longTheaterName[lang]}</div></p>`
			);
		} else {
			let options = {
				year: 'numeric',
				month: 'long',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			};
			let strCurrentDate = dateOfReservation.toLocaleDateString(lang, options);

			return (
				`<div class='reservation-titel'>${dictionaryServer.new_reservation_text[lang]} :</div>` +
				`<table class='user-table'><tr><td>${dictionaryServer.lang_name[lang]} :</td><td>${name}</td></tr>` +
				`<tr><td>Email :</td><td>${email}</td></tr>` +
				`<tr><td>${dictionaryServer.lang_when[lang]} :</td><td>${strCurrentDate}</td></tr></table>`
			);
		}
	}

	function makeReservationsTable(lang, reservations, amount) {
		if (!!htmlReservationsTable) return htmlReservationsTable;
		// console.log(reservations);

		let table = '<table class="play-table" cellpadding="0" cellspacing="15"><tbody>';
		reservations.forEach(element => {
			let thisPlay = theater.plays.find(item => item.id === element.play_id);
			let playName = thisPlay.title[lang];
			let playDate = new Date(element.date);
			let options = {
				year: 'numeric',
				month: 'short',
				day: '2-digit',
			};
			let strDate = playDate.toLocaleDateString(lang, options);

			// 📆 🎭 📍

			table =
				table +
				`<tr><td><div class='play-date'>${strDate}</div><div class='play-date'>${element.time}</div></td>` +
				`<td><div class='play-titel'>${playName.toUpperCase()}</div>` +
				`<div class='play-info'>${thisPlay.genre[lang]}, ${thisPlay.age}, ${dictionaryServer.play_lang[thisPlay.lang_id][lang]}</div>` +
				`<table class='tickets-table'>`;

			let playAmount = 0;
			element.tickets.forEach(ticket => {
				if (ticket.count < 1) return;

				let ticketType = theater.prices.find(price => price.type === ticket.type);
				table =
					table +
					`<tr><td class='tickets-name'>${ticketType.text[lang]}</td><td>${ticketType.value}€</td>` +
					`<td>${ticket.count}${dictionaryServer.lang_count[lang]}</td>` +
					`<td class='tickets-amount'>${ticketType.value * ticket.count}€</td></tr>`;
				playAmount += ticketType.value * ticket.count;
			});

			table =
				table +
				// `<tr><td colspan='3' class='tickets-name'><div class='play-amount-border'>${dictionaryServer.total_amount[lang]}</div></td>` +
				// `<td class='tickets-amount'><div class='play-amount-border'>${playAmount}€</div></td></tr>` +
				`<tr><td colspan='4'><div class='play-amount-border'>` +
				`<table width='100%'><tr><td class='tickets-name left0'>${dictionaryServer.total_amount[lang]}</td>` +
				`<td class='tickets-amount'>${playAmount}€</td></tr></table>` +
				`</div></td></tr></table><div class='address'>${theater.stageAddress.full_string}</div></td></tr>`;

			// console.log(element);
		});
		table =
			table +
			`<tr><td><div class='total-amount'>${dictionaryServer.total_amount[lang]}</div></td>` +
			`<td class='td-right'><div class='total-amount'>${amount}€</div></td></tr></tbody></table>`;
		// console.log(table);

		htmlReservationsTable = table;
		return htmlReservationsTable;
	}
};
