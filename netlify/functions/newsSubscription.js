import nodemailer from 'nodemailer';
import fs from 'fs';
import { NewslettersDB } from './lib/antreprizaDB.cjs';

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

	const messageData = JSON.parse(event.body);
	const { lang, email, sid, usid } = messageData;

	if (email && email.length > 0) return await emailRegistration(lang, email);
	else if (sid) return emailConfirmation(lang, sid);
	else if (usid) return emailRemoving(lang, usid);

	async function emailRegistration(lang, email) {
		NewslettersDB.openDatabase();
		let res = NewslettersDB.addNewEmail(lang, email);
		NewslettersDB.closeDatabase();
		const sid = res.sid;
		if (sid === 0) {
			console.error(dictionaryServer.email_service_error[lang]);
			return {
				statusCode: 500,
				body: JSON.stringify({
					message: dictionaryServer.email_service_error[lang],
				}),
			};
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
				user: process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION,
				pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
			},
		});

		const mailOptions = {
			from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION}>`,
			to: email,
			subject: `${dictionaryServer.email_news_subscription_reg_subject[lang]}`,
			html: makeHtmlEmail(lang, email, sid, false),
		};

		let mailTo;
		if (process.env.MODE === process.env.MODE_PRODUCTION) {
			mailTo = process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION + ', ' + process.env.ANTREPRIZA_EMAIL_MAMONTOV;
		} else {
			mailTo = process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;
		}
		const mailOptionsAntrepriza = {
			from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION}>`,
			to: mailTo,
			subject: `${dictionaryServer.email_news_subscription_reg_subject_antrepriza[lang]}`,
			html: makeHtmlEmail(lang, email, sid, true),
		};

		try {
			await transporter.sendMail(mailOptions);

			try {
				await transporter.sendMail(mailOptionsAntrepriza);
			} catch (error) {}

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
	}

	function makeHtmlEmail(lang, email, sid, forAntrepriza = false) {
		return `<!DOCTYPE html><html lang="${lang}">` + makeHead(lang) + makeBody(lang, email, sid, forAntrepriza) + `</html>`;
	}

	function makeHead(lang) {
		let htmlHead =
			'<head><meta charset="UTF-8"><meta http-equiv="content-type" content="text/html"><title>' +
			theater.shortTheaterName[lang] +
			' - ' +
			dictionaryServer.email_news_subscription_reg_subject[lang] +
			'</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>' +
			'table {border-spacing:0;} td {vertical-align:top;}' +
			'.email-body {font-size:16px;background-color:#292929;color:#d6d6d6;}' +
			'.email-body a {color:#d6d6d6;} .email-body .im * {color:#d6d6d6;}' +
			'.body-table {width:100%;}' +
			'.email-wrapper {padding:2rem;margin-left:auto;margin-right:auto;} ' +
			'.subscription-titel {font-size:1.35rem;margin-bottom:15px;line-height:1.2em;}' +
			'.lh12 {line-height:1.2em;} .fcw {color:#d6d6d6;} .b700 {font-weight:700;} .m50 {margin:50px 0;}' +
			'.confirm-button {border:1px solid #87605e;padding:10px 20px;text-decoration:none;line-height:1.2em;}' +
			'.email-body a.confirm-button{color:#87605e;}' +
			'.user-table {margin-bottom:15px;}' +
			'.user-table tr td {min-width:5em;color:#d6d6d6;}' +
			'</style></head>';

		return htmlHead;
	}

	function makeBody(lang, email, sid, forAntrepriza) {
		return (
			`<body><div class='email-body'><table class='body-table'><tbody><tr><td class='email-wrapper'>` +
			makeTextAboutConfirmation(lang, email, sid, forAntrepriza) +
			`</td></tr></tbody></table></div></body>`
		);
	}

	function makeTextAboutConfirmation(lang, email, sid, forAntrepriza) {
		if (forAntrepriza) {
			return (
				`<div class='subscription-titel fcw'>${dictionaryServer.new_subscription_text[lang]} :</div>` +
				`<table class='user-table'>` +
				`<tr><td>Email :</td><td>${email}</td></tr>` +
				`<tr><td>SID :</td><td>${sid}</td></tr>` +
				`</table>`
			);
		} else {
			let strHello = dictionaryServer.dear_audience[lang] + (lang === 'ru' ? '!' : ',');
			return (
				`<div class='subscription-titel b700 fcw'>${strHello}</div>` +
				`<p class='lh12 fcw'>${dictionaryServer.email_subscription_text[lang]}</p>` +
				`<p class='lh12 fcw'>${dictionaryServer.email_subscription_text2[lang]}</p>` +
				`<p class='m50'><a href='https://antrepriza.eu/${lang}/newsletter?sid=${sid}' class='confirm-button'>${dictionaryServer.email_subscription_button_text[lang]}</a></p>` +
				`<p><div class='lh12 fcw'>${dictionaryServer.email_subscription_text3[lang]}</div>` +
				`<div class='lh12 fcw'>${theater.longTheaterName[lang]}</div>` +
				`<a href='${theater.our_website_link}/${lang}' class='lh12 fcw'>${theater.our_website_text}</a></p>`
			);
		}
	}

	async function emailConfirmation(lang, sid) {
		NewslettersDB.openDatabase();
		let res = NewslettersDB.confirmEmail(sid);
		NewslettersDB.closeDatabase();
		if (!res) {
			console.error(dictionaryServer.email_service_error[lang]);
			return {
				statusCode: 500,
				body: JSON.stringify({
					message: dictionaryServer.email_service_error[lang],
				}),
			};
		}

		const transporter = nodemailer.createTransport({
			pool: true,
			host: process.env.ANTREPRIZA_SMTP_HOST,
			port: 465,
			secure: true, // use TLS
			auth: {
				user: process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION,
				pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
			},
		});

		let mailTo;
		if (process.env.MODE === process.env.MODE_PRODUCTION) {
			mailTo = process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION;
		} else {
			mailTo = process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;
		}
		const mailOptions = {
			from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION}>`,
			to: mailTo,
			subject: `${dictionaryServer.email_news_subscription_confirmed_subject[lang]}`,
			html: makeHtmlConfirmedEmail(lang, sid, false),
		};
		try {
			await transporter.sendMail(mailOptions);
		} catch (error) {
			console.error(error);
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: dictionaryServer.result_email_confirmed[lang],
			}),
		};
	}

	function makeHtmlConfirmedEmail(lang, sid) {
		return (
			`<!DOCTYPE html><html lang="${lang}">` +
			'<head><meta charset="UTF-8"><meta http-equiv="content-type" content="text/html"><title>' +
			theater.shortTheaterName[lang] +
			' - ' +
			dictionaryServer.email_news_subscription_confirmed_subject[lang] +
			'</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>' +
			'table {border-spacing:0;} td {vertical-align:top;}' +
			'.email-body {font-size:16px;background-color:#292929;color:#d6d6d6;}' +
			'.email-body .im * {color:#d6d6d6;}' +
			'.body-table {width:100%;}' +
			'.email-wrapper {padding:2rem;margin-left:auto;margin-right:auto;} ' +
			'.user-table {margin-bottom:15px;}' +
			'.user-table tr td {min-width:5em;color:#d6d6d6;}' +
			'</style></head>' +
			`<body><div class='email-body'><table class='body-table'><tbody><tr><td class='email-wrapper'>` +
			`<table class='user-table'>` +
			`<tr><td>SID :</td><td>${sid}</td></tr>` +
			`</table>` +
			`</td></tr></tbody></table></div></body>` +
			`</html>`
		);
	}

	async function emailRemoving(lang, usid) {
		NewslettersDB.initDatabase();
		let res = NewslettersDB.removeEmail(usid);
		NewslettersDB.closeDatabase();
		if (!res) {
			console.error(dictionaryServer.email_service_error[lang]);
			return {
				statusCode: 500,
				body: JSON.stringify({
					message: dictionaryServer.email_service_error[lang],
				}),
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: dictionaryServer.result_email_removed[lang],
			}),
		};
	}
};
