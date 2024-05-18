import nodemailer from 'nodemailer';
import fs from 'fs';

let dictionaryServer;
let theater;

// import dictionaryServer from './public/data/dictionary_server.json';

// let dictionaryServer;
// const theater = require('/data/theater.json');

// import dictionaryServer from './data/dictionary_server.json' assert { type: 'json' };
// import theater from './data/theater.json' assert { type: 'json' };

export const handler = async (event, context) => {
	try {
		console.log('Current directory:', __dirname);
		console.log('Current directory 2:', process.cwd());
		console.log('Files:');
		fs.readdirSync('./').forEach(file => {
			console.log(file);
		});
		console.log('...');

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

	// const dictionaryServer = require('./data/dictionary_server.json');
	// console.log('Email ENV: address - ' + process.env.ANTREPRIZA_EMAIL + ', pass - ' + process.env.ANTREPRIZA_PASSWORD);
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
		'.email-wrapper {padding:2rem;align:center;}' +
		'</style></head>'
	);
}

function makeBody(lang, name, email, reservations, amount) {
	return (
		`<body><table class='email'><tbody><tr><td class='email-wrapper'><h1>Hello, ${name}</h1>` +
		makeReservationsTable(lang, reservations) +
		`<h5>Your total amount: ${amount}€</h5></td></tr></tbody></table></body>`
	);
}

function makeReservationsTable(lang, reservations) {
	console.log(reservations);
	let table = '<table><tbody>';
	reservations.forEach(element => {
		let playName = theater.plays.find(item => item.id === element.play_id).title[lang];
		let playDate = new Date(element.date);
		let options = {
			year: 'numeric',
			month: 'long',
			day: '2-digit',
		};
		let strDate = playDate.toLocaleDateString(lang, options);

		table = table + `<tr><td>${strDate}, ${element.time} : ${playName}</td></tr>`;
		console.log(element);
	});
	table = table + '</tbody></table>';
	console.log(table);
	return table;
}
