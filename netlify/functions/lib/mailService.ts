import nodemailer from 'nodemailer';
import theater from '@data/theater.json';

import { readFileSync } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

const TEMPLATES_DIR = path.resolve(__dirname, './lib/emails/html');

export const TemplateNames = {
	reservations: 'reservations',
	subscription_user_verify: 'subscription_user',
	subscription_theater_confirm: 'subscription_theater',
	contact_form: 'contact_form',
} as const;

export type TemplateNames = (typeof TemplateNames)[keyof typeof TemplateNames];

export type SubscriptionUserVariables = {
	lang: string;
	subject: string;
	previewSubject: string;
	hello: string;
	happy_text: string;
	verify_text: string;
	verify_url: string;
	buttonText: string;
	regards: string;
	team: string;
};
export type SubscriptionTheaterVariables = {
	email: string;
};
export type ContactFormVariables = {
	lang: string;
	subject: string;
	// previewSubject: string;
	hello: string;
	main_text: string;
	timestamp?: string;
	team: string;
	topic_label: string;
	topic: string;
	name_label: string;
	name: string;
	email_label: string;
	email: string;
	message_label: string;
	message: string;
};

export type EmailReservation = {
	id: string;
	date: string;
	time: string;
	event_name: string;
	event_name_marker?: string;
	event_description: string;
	stage_name: string;
	stage_address: string;
	tickets: {
		type: string;
		price: string;
		count: string;
		amount: string;
	}[];
	total_amount_label: string;
	total_amount: string;
};

export type ReservationsVariables = {
	lang: string;
	subject: string;
	theaterBlock?: {
		main_text: string;
		name_label: string;
		name: string;
		email_label: string;
		email: string;
		when_label: string;
		when: string;
	};
	userBlock?: {
		hello: string;
		main_text: string;
		location_text: string;
		location_url_text: string;
		note_list: string;
		note_item1: string;
		note_item2: string;
		note_item3: string;
		reservation_introduce: string;
		review_introduce: string;
		review_introduce2: string;
		regards: string;
		team: string;
	};
	reservations: EmailReservation[];
};

function getHdbrTemplate(templateName: TemplateNames) {
	const filePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
	return readFileSync(filePath, 'utf8');
}

export function getEmailHtml(
	templateName: TemplateNames,
	emailVariables: SubscriptionUserVariables | SubscriptionTheaterVariables | ContactFormVariables | ReservationsVariables,
) {
	try {
		const hdbrTemplateContent = getHdbrTemplate(templateName);
		const template = Handlebars.compile(hdbrTemplateContent);
		return template(emailVariables);
	} catch (error) {
		console.error('Prepare EEmail [fatal]:');
		console.error(error);
		return undefined;
	}
}

export type TransporterInfo = {
	transporter: nodemailer.Transporter;
	emailFrom: string;
	emailToAntrepriza: string;
};
export function createTransporter(transporterMail: string, lang: string): TransporterInfo {
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
					secure: true,
					auth: {
						user: transporterMail,
						pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
					},
					// debug: true,  // включите, чтобы увидеть больше логов
					// logger: true,
				});

	const fromEmailDescription: string = `${theater.longTheaterName[lang]} `;
	const emailFrom: string =
		process.env.MODE === process.env.MODE_LOCALHOST
			? `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`
			: `${fromEmailDescription}<${transporterMail}>`;
	// const fromEmail: string = `${fromEmailDescription}<${transporterMail}>`;
	// const fromEmail: string = `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`;

	const emailToAntrepriza: string =
		process.env.MODE === process.env.MODE_PRODUCTION ? transporterMail : process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;

	return { transporter, emailFrom, emailToAntrepriza };
}

export type TMailData = {
	from: string;
	to: string;
	subject: string;
	html: string;
};

export async function sendMail(transporter: nodemailer.Transporter, mailData: TMailData): Promise<boolean> {
	try {
		if (mailData.html === undefined) {
			throw new Error('Email HTML content is undefined');
		}
		await transporter.sendMail(mailData);
		return true;
	} catch (error) {
		console.error('Nodemailer: sendEmail() [fatal]:');
		console.error(error);
		return false;
	}
}

export type TMail = {
	to: string;
	subject: string;
	html: string;
};

export async function sendMails(lang: string, transporterMail: string, clientMail: TMail): Promise<boolean>;
export async function sendMails(lang: string, transporterMail: string, clientMail: TMail, antreprizaMail: TMail): Promise<boolean>;
export async function sendMails(lang: string, transporterMail: string, clientMail: TMail, antreprizaMail?: TMail): Promise<boolean> {
	const { transporter, emailFrom, emailToAntrepriza } = createTransporter(transporterMail, lang);

	const mailOptionsClient = {
		from: emailFrom,
		to: clientMail.to,
		subject: clientMail.subject,
		html: clientMail.html,
	};

	try {
		await transporter.sendMail(mailOptionsClient);

		if (antreprizaMail) {
			const mailOptionsAntrepriza = {
				from: emailFrom,
				to: emailToAntrepriza,
				subject: antreprizaMail.subject,
				html: antreprizaMail.html,
			};

			try {
				await transporter.sendMail(mailOptionsAntrepriza);
			} catch (error) {
				console.error('Email to Antrepriza [not fatal]:');
				console.error(error);
			}
		}

		return true;
	} catch (error) {
		console.error('Email to client [fatal]:');
		console.error(error);
		return false;
	}
}
