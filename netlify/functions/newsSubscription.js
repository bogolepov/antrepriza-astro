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
	} catch (error) {
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
	const { lang, email } = messageData;

	const htmlEmail = makeHtmlEmail(lang, email);

	const mailOptions = {
		from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL}>`,
		to: email,
		subject: `${dictionaryServer.email_news_subscription_subject[lang]}`,
		html: htmlEmail,
	};

	try {
		// console.log('call sendMail.......');
		// console.log(mailOptions);

		await transporter.sendMail(mailOptions);
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

	function makeHtmlEmail(lang, email) {
		return `<!DOCTYPE html><html lang="${lang}">` + makeHead(lang) + makeBody(lang, email) + `</html>`;
	}

	function makeHead(lang) {
		let htmlHead =
			'<head><meta charset="UTF-8"><title>' +
			theater.shortTheaterName[lang] +
			' - ' +
			dictionaryServer.email_news_subscription_subject[lang] +
			'</title><style>' +
			'table {border-spacing:0;} td {vertical-align:top;}' +
			'.email-body {font-size:16px;background-color:#292929;color:#d6d6d6;}' +
			'.email-body a {color:#d6d6d6;text-decoration:none;} .email-body .im * {color:#d6d6d6;}' +
			'.body-table {width:100%;}' +
			'.email-wrapper {padding:2rem;margin-left:auto;margin-right:auto;} ' +
			'.reservation-titel {font-size:1.35rem;margin-bottom:15px;line-height:1.2em;}' +
			'.lh12 {line-height:1.2em;} .fcw {color:#d6d6d6;} .b700 {font-weight:700;} .m50 {margin:50px 0;}' +
			'.confirm-button {border:1px solid #87605e;padding:10px 20px;text-decoration:none;line-height:1.2em;}' +
			'.email-body a.confirm-button{color:#87605e;}' +
			'</style></head>';

		return htmlHead;
	}

	function makeBody(lang, email) {
		return (
			`<body class='email-body'><table class='body-table'><tbody><tr><td class='email-wrapper'>` +
			makeTextAboutConfirmation(lang) +
			`</td></tr></tbody></table></body>`
		);
	}

	function makeTextAboutConfirmation(lang) {
		let strHello = dictionaryServer.dear_audience[lang] + (lang === 'ru' ? '!' : ',');
		// https://antrepriza.netlify.app/ru/
		return (
			`<div class='reservation-titel b700 fcw'>${strHello}</div>` +
			`<p class='lh12 fcw'>${dictionaryServer.email_subscription_text[lang]}</p>` +
			`<p class='lh12 fcw'>${dictionaryServer.email_subscription_text2[lang]}</p>` +
			`<p class='m50'><a href='https://antrepriza.netlify.app/${lang}/subscription' class='confirm-button'>${dictionaryServer.email_subscription_button_text[lang]}</a></p>` +
			`<p><div class='lh12 fcw'>${dictionaryServer.email_subscription_text3[lang]}</div>` +
			`<a href='${theater.main_website}${lang}/subscription' class='lh12 fcw'>${theater.longTheaterName[lang]}</a></p>`
		);
	}
};