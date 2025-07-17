import type { HandlerResponse } from '@netlify/functions';
import nodemailer from 'nodemailer';
import { getJsonTheater } from './utils';

export type TMail = {
	to: string;
	subject: string;
	html: string;
};
export async function sendMails(lang: string, transporterMail: string, clientMail: TMail): Promise<HandlerResponse>;
export async function sendMails(
	lang: string,
	transporterMail: string,
	clientMail: TMail,
	antreprizaMail: TMail
): Promise<HandlerResponse>;
export async function sendMails(
	lang: string,
	transporterMail: string,
	clientMail: TMail,
	antreprizaMail?: TMail
): Promise<HandlerResponse> {
	console.log('SM-1');
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
					port: 587,
					secure: false, // use TLS
					ignoreTLS: true,
					auth: {
						user: transporterMail,
						pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
					},
				});
	console.log('SM-2: transporter......');
	console.log(transporter);

	const theater = getJsonTheater();
	console.log('SM-3');
	const fromEmailDescription: string = theater ? `${theater.longTheaterName[lang]} ` : '';
	const fromEmail: string =
		process.env.MODE === process.env.MODE_LOCALHOST
			? `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`
			: `${fromEmailDescription}<${transporterMail}>`;

	console.log('SM-4');
	const mailOptionsClient = {
		from: fromEmail,
		to: clientMail.to,
		subject: clientMail.subject,
		html: clientMail.html,
	};
	console.log('SM-5');
	// console.log(mailOptionsClient);

	try {
		console.log('SM-6');
		await transporter.sendMail(mailOptionsClient);
		console.log('SM-7');

		if (antreprizaMail) {
			console.log('SM-8');
			const antreprizaMailTo: string =
				process.env.MODE === process.env.MODE_PRODUCTION ? transporterMail : process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;

			const mailOptionsAntrepriza = {
				from: fromEmail,
				to: antreprizaMailTo,
				subject: antreprizaMail.subject,
				html: antreprizaMail.html,
			};

			console.log('SM-9');
			try {
				await transporter.sendMail(mailOptionsAntrepriza);
				console.log('SM-10');
			} catch (error) {
				console.log('SM-10: error!!!!!');
				console.error(error);
			}
		}
		console.log('SM-11');

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Email sent successfully',
			}),
		};
	} catch (error) {
		console.log('SM-12');
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: error.message,
			}),
		};
	}
}
