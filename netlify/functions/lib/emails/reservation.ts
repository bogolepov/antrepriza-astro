import type { TReservationExt } from '../db/makeReservationDB';
import { fromHtmlToPlainText } from '../utils';
import dictionaryServer from '@data/dictionary_server.json';
import dictionary from '@data/dictionary.json';
import theater from '@data/theater.json';
import plays from '@data/plays.json';
import prices from '@data/prices.json';
import type { TOrderItem } from '@scripts/types/reservation';

export function makeContent(
	lang: string,
	name: string,
	email: string,
	htmlReservations: string,
	when: string,
	toAntrepriza: boolean
): string {
	let diffText: string;

	if (toAntrepriza) {
		diffText = `\
<tr><td colspan="2" style="font-size: 125%; padding-bottom: 15px; line-height: 120%; color: #d6d6d6; font-weight: 500">\
${dictionaryServer.new_reservation_text[lang]}\
</td></tr>\
<tr>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top">${dictionaryServer.lang_name[lang]} :</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 5px 8px">${fromHtmlToPlainText(
			name
		)}</td>\
</tr>\
<tr>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top">Email :</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 5px 8px">
<a href='${'mailto:' + fromHtmlToPlainText(email)}' style="line-height: 120%; color: #d6d6d6">${fromHtmlToPlainText(
			email
		)}</a></td>\
</tr>\
<tr>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top">${dictionaryServer.lang_when[lang]} :</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 15px 8px">${when}</td>\
</tr>\
<tr><td colspan="2">${htmlReservations}</td></tr>\
`;
	} else {
		const dateOfReservation = new Date(when);
		const getHello = (hour: number) => {
			if (hour < 6 && lang === 'ru') return dictionaryServer.hello[lang];
			else if (hour < 12) return dictionaryServer.good_morning[lang];
			else if (hour < 18) return dictionaryServer.good_afternoon[lang];
			else return dictionaryServer.good_evening[lang];
		};
		const strHello =
			getHello(dateOfReservation.getHours()) +
			(lang === 'ru' ? ', ' : ' ') +
			fromHtmlToPlainText(name) +
			(lang === 'ru' ? '!' : '.');
		const strWelcome1_WithLinks = makeLinks(dictionaryServer.email_reservation_welcome1[lang]);

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
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 0 0 20px 20px">${dictionaryServer.email_reservation_note3[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 5px">${dictionaryServer.email_reservation_note4[lang]}</td></tr>\
<tr><td>${htmlReservations}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 20px 0 15px 0">${strWelcome1_WithLinks}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 0 0 15px 0">${dictionaryServer.email_reservation_welcome2[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6">${theater.longTheaterName[lang]}</td></tr>\
<tr><td style="line-height: 120%">\
<a href='${theater.our_website_link}/${lang}/' style="line-height: 120%; color: #d6d6d6">${theater.our_website_text}</a>\
</td></tr>\
`;
	}

	return `\
<table border="0" cellpadding="0" role="presentation" style="width: 100%; margin: 0; padding: 0 0 15px 0">\
<tbody>\
${diffText}\
</tbody>\
</table>\
`;
}

export function makeReservationsBlock(lang: string, reservations: TReservationExt[], amount: number): string {
	return `\
<table border="0" cellspacing="0" role="presentation" style="width: 100%; margin: 0; padding: 15px 0 0 0; \
border-top: 1px solid #d6d6d6; border-bottom: 1px solid #d6d6d6"><tbody>\
${makeEventsRows(lang, reservations)}\
</tbody></table>\
`;
}

function getOrderIdText(event: TReservationExt): string {
	if (event?.order_id) return '#' + event.order_id;
	else return '';
}

function makeEventsRows(lang: string, reservations: TReservationExt[]): string {
	if (!reservations) return '';

	let rows: string = '';

	// console.log('events: ' + reservations.length.toString());
	reservations.forEach((event, index) => {
		// console.log(event);

		let play = plays.find(item => item.id === event.play_id); // play - thisPlay
		let playName: string = play.title[lang];
		let playDate = new Date(event.date);
		let options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
		};
		let strDate: string = playDate.toLocaleDateString(lang, options);

		let stage = theater.stages.find(stg => stg.sid === event.stage_sid);
		let ticketsRows = makeTicketsRows(lang, event.tickets);
		if (!ticketsRows || !ticketsRows.amount || !ticketsRows.html) return '';

		rows =
			rows +
			`\
<tr><td style="vertical-align: top">\
<table border="0" cellspacing="0" role="presentation" style="width: 100%; margin: 0; padding: 0"><tbody>\
<tr><td style="font-size: 85%; line-height: 120%; color: #888888; font-weight: 400; padding: 3px 0 0 0">${getOrderIdText(
				event
			)}</td></tr>\
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
<td colspan="2" style="padding-top: 3px; text-align: left; vertical-align: top; color: #888888">${
				dictionary.total_amount[lang]
			}</td>\
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

type TTicketsRows = {
	amount: number;
	html: string;
};

function makeTicketsRows(lang: string, tickets: TOrderItem[]): TTicketsRows | undefined {
	if (!tickets) return;

	let ticketsRows: string = '';
	let amount: number = 0;

	tickets.forEach(ticket => {
		if (ticket.count < 1) return;

		let ticketType = prices.find(price => price.type === ticket.type);
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

function makeLinks(text: string): string {
	if (text) {
		theater.review_links.forEach(item => {
			text = text.replace(
				`%${item.name}`,
				`<a href='${item.link}' style="line-height: 120%; color: #87605e; font-weight: 700">${item.name}</a>`
			);
		});
	}
	return text;
}
