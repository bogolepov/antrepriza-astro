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
		console.log(error);
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

	const htmlEmailClient = makeHtmlForClient(lang, name, email, reservations, amount);
	// console.log(htmlEmailClient);

	const mailOptions = {
		from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL}>`,
		to: email,
		subject: `${dictionaryServer.email_ticket_subject[lang]}`,
		text: `Hello, ${name}!`,
		html: htmlEmailClient,
	};

	try {
		// console.log('call sendMail.......');
		let info = await transporter.sendMail(mailOptions);

		// console.log('result:');
		// console.log(info);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Email sent successfully',
			}),
		};
	} catch (error) {
		// console.log('error:');
		// console.log(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: error.message,
			}),
		};
	}
};

function makeHtmlForClient(lang, name, email, reservations, amount) {
	return `<!DOCTYPE html><html lang="${lang}">` + makeHead(lang) + makeBody(lang, name, email, reservations, amount) + `</html>`;
}

function makeHead(lang) {
	return (
		'<head><meta charset="UTF-8"><title>' +
		theater.shortTheaterName[lang] +
		' - ' +
		dictionaryServer.email_ticket_subject[lang] +
		'</title><style>' +
		'.email {width:100%;font-size:16px;background-color:#292929;color:#d6d6d6;} ' +
		'.email-wrapper {padding:2rem;margin-left:auto;margin-right:auto;} ' +
		'.tickets-table {width:90%; max-width:600px;} ' +
		'.play-titel {font-weight:700; font-size: 1.5rem;line-height:1.1em;padding-top:0.5em;border-top: 1px solid;margin-top:0.3em;} ' +
		'.play-date {color: #87605e; font-weight: 700; font-size: 1.1rem;padding-bottom:0.1em;line-height:1.2em;} ' +
		'.play-info {font-size:1.1rem; font-weight:400;line-height:1.2em;padding-bottom:0.25em;}' +
		'.tickets-info {padding-left:2em;line-height:1.3em;}' +
		'.total-amount {font-size:1.3rem; line-height:1.2em;padding-top:0.5em;border-top: 1px solid;margin-top:0.3em;}' +
		'.address {font-size:1.15rem; line-height:1.2em;}' +
		'</style></head>'
	);
}

function makeBody(lang, name, email, reservations, amount) {
	return (
		`<body><table class='email'><tbody><tr><td class='email-wrapper'>` +
		makeTextAboutReservation(lang, name, email) +
		makeReservationsTable(lang, reservations, amount) +
		`</td></tr></tbody></table></body>`
	);
}

function makeTextAboutReservation(lang, name, email) {
	return `<h1>Hello, ${name}</h1>`;
}

function makeReservationsTable(lang, reservations, amount) {
	console.log(reservations);
	let table = '<table class="tickets-table"><tbody>';
	reservations.forEach(element => {
		let thisPlay = theater.plays.find(item => item.id === element.play_id);
		let playName = thisPlay.title[lang];
		let playDate = new Date(element.date);
		let options = {
			year: 'numeric',
			month: 'long',
			day: '2-digit',
		};
		let strDate = playDate.toLocaleDateString(lang, options);

		table =
			table +
			`<tr><td><div class='play-titel'>${playName.toUpperCase()}</div>` +
			`<div class='play-date'>📆 ${strDate}, ${element.time}</div></td></tr>` +
			`<div class='play-info'>🎭 ${thisPlay.genre[lang]}, ${thisPlay.age}, ${thisPlay.lang[lang]}</div>`;

		element.tickets.forEach(ticket => {
			if (ticket.count < 1) return;

			let ticketType = theater.prices.find(price => price.type === ticket.type);
			table =
				table +
				`<tr><td class='tickets-info'>${ticketType.text_short[lang]}: ${ticket.count} x ${ticketType.value}€ = ${
					ticketType.value * ticket.count
				}€</td></tr>`;
		});

		table = table + `<tr><td class='address'>📍 ${theater.stageAddress.full_string}</td></tr>`;

		console.log(element);
	});
	table = table + `<tr><td><div class='total-amount'>${dictionaryServer.total_amount[lang]}: ${amount}€</div></td></tr></tbody></table>`;
	console.log(table);
	return table;
}
