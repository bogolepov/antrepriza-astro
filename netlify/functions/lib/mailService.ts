import type { HandlerResponse } from '@netlify/functions';
import nodemailer from 'nodemailer';
import { getJsonTheater } from './utils';

export type TMail = {
	to: string;
	subject: string;
	html: string;
};
export async function sendMails(lang: string, transporterMail: string, clientMail: TMail): Promise<HandlerResponse>;
export async function sendMails(lang: string, transporterMail: string, clientMail: TMail, antreprizaMail: TMail): Promise<HandlerResponse>;
export async function sendMails(
	lang: string,
	transporterMail: string,
	clientMail: TMail,
	antreprizaMail?: TMail
): Promise<HandlerResponse> {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.ANTREPRIZA_GMAIL_EMAIL,
			pass: process.env.ANTREPRIZA_GMAIL_PASSWORD,
		},
	});
	// const transporter =
	// process.env.MODE === process.env.MODE_LOCALHOST
	// 	? nodemailer.createTransport({
	// 			service: 'gmail',
	// 			auth: {
	// 				user: process.env.ANTREPRIZA_GMAIL_EMAIL,
	// 				pass: process.env.ANTREPRIZA_GMAIL_PASSWORD,
	// 			},
	// 	  })
	// 	: nodemailer.createTransport({
	// 			pool: true,
	// 			host: process.env.ANTREPRIZA_SMTP_HOST,
	// 			port: 465,
	// 			secure: true, // use TLS
	// 			auth: {
	// 				user: transporterMail,
	// 				pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
	// 			},
	// 	  });

	const theater = getJsonTheater();
	const fromEmailDescription: string = theater ? `${theater.longTheaterName[lang]} ` : '';
	// const fromEmail: string = `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`;
	const fromEmail: string =
		process.env.MODE === process.env.MODE_LOCALHOST
			? `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`
			: `${fromEmailDescription}<${transporterMail}>`;

	const mailOptionsClient = {
		from: fromEmail,
		to: clientMail.to,
		subject: clientMail.subject,
		html: clientMail.html,
	};

	try {
		await transporter.sendMail(mailOptionsClient);

		if (antreprizaMail) {
			const antreprizaMailTo: string =
				process.env.MODE === process.env.MODE_PRODUCTION
					? transporterMail + ', ' + process.env.ANTREPRIZA_EMAIL_MAMONTOV
					: process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;

			const mailOptionsAntrepriza = {
				from: fromEmail,
				to: antreprizaMailTo,
				subject: antreprizaMail.subject,
				html: antreprizaMail.html,
			};

			try {
				await transporter.sendMail(mailOptionsAntrepriza);
			} catch (error) {
				console.error(error);
			}
		}

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
