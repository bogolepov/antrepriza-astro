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
	console.log('sendMails1');
	const transporter =
		process.env.MODE === process.env.MODE_LOCALHOST
			? nodemailer.createTransport({
					service: 'gmail',
					auth: {
						user: process.env.ANTREPRIZA_GMAIL_EMAIL,
						pass: process.env.ANTREPRIZA_GMAIL_PASSWORD,
					},
			  })
			: nodemailer.createTransport({
					pool: true,
					host: process.env.ANTREPRIZA_SMTP_HOST,
					port: 465,
					secure: true, // use TLS
					auth: {
						user: transporterMail,
						pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
					},
			  });

	console.log('sendMails2');
	const theater = getJsonTheater();
	const fromEmailDescription: string = theater ? `${theater.longTheaterName[lang]} ` : '';
	console.log('sendMails3');
	const fromEmail: string =
		process.env.MODE === process.env.MODE_LOCALHOST
			? `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`
			: `${fromEmailDescription}<${transporterMail}>`;

	console.log('sendMails4');
	const mailOptionsClient = {
		from: fromEmail,
		to: clientMail.to,
		subject: clientMail.subject,
		html: clientMail.html,
	};

	console.log('sendMails5');
	try {
		console.log('sendMails5-1');
		await transporter.sendMail(mailOptionsClient);

		console.log('sendMails5-2');
		if (antreprizaMail) {
			console.log('sendMails5-3');
			const antreprizaMailTo: string =
				process.env.MODE === process.env.MODE_PRODUCTION
					? transporterMail + ', ' + process.env.ANTREPRIZA_EMAIL_MAMONTOV
					: process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;

			console.log('sendMails5-4');
			const mailOptionsAntrepriza = {
				from: fromEmail,
				to: antreprizaMailTo,
				subject: antreprizaMail.subject,
				html: antreprizaMail.html,
			};

			console.log('sendMails5-5');
			try {
				console.log('sendMails5-6');
				await transporter.sendMail(mailOptionsAntrepriza);
				console.log('sendMails5-7');
			} catch (error) {
				console.log('sendMails5-8');
				console.error(error);
			}
		}
		console.log('sendMails5-9');

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Email sent successfully',
			}),
		};
	} catch (error) {
		console.log('sendMails5-10');
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: error.message,
			}),
		};
	}
}
