import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import plays from './src/data/plays.json';
import icon from 'astro-icon';
import vue from '@astrojs/vue';
let now = new Date();
// const offset = now.getTimezoneOffset();
// now = new Date(now.getTime() - offset * 60 * 1000);

function isNoIndex(url) {
	let lowUrl = url.toLowerCase();
	if (
		lowUrl.includes('https://antrepriza.eu/ru/theater/people/') ||
		lowUrl.includes('https://antrepriza.eu/de/theater/people/')
	) {
		let urlArr = lowUrl.split('/');
		let i = urlArr.indexOf('people');
		if (i !== -1 && i < urlArr.length - 1 && urlArr[i + 1] === 'alm') return false;
		else return true;
	}
	return false;
}
function isEvents(url) {
	let lowUrl = url.toLowerCase();
	if (
		lowUrl.includes('https://antrepriza.eu/ru/theater/events/') ||
		lowUrl.includes('https://antrepriza.eu/de/theater/events/')
	) {
		return true;
	}
	return false;
}
function isActualEvent(url) {
	let urlArr = lowUrl.split('/');
	let i = urlArr.indexOf('events');
	if (i + 1 < urlArr.length) {
		let eventName = urlArr[i + 1];
		let nameArr = eventName.split('_');
		if (nameArr.length > 1 && nameArr[1].length === 8) {
			let evDate = nameArr[1];
			let now = new Date();
			let nowDate = now.toISOString().split('T')[0].replace('-', '');
			return evDate > nowDate;
		}
	}
	return false;
}
function isVerySpecialPage(url) {
	switch (url) {
		case 'https://antrepriza.eu/de/program/':
		case 'https://antrepriza.eu/ru/program/':
		case 'https://antrepriza.eu/de/tickets/':
		case 'https://antrepriza.eu/ru/tickets/':
		case 'https://antrepriza.eu/de/':
		case 'https://antrepriza.eu/ru/':
			return true;
		default:
			return false;
	}
}
function isSpecialPage(url) {
	switch (url) {
		case 'https://antrepriza.eu/de/plays/':
		case 'https://antrepriza.eu/ru/plays/':
		case 'https://antrepriza.eu/de/gallery/':
		case 'https://antrepriza.eu/ru/gallery/':
		case 'https://antrepriza.eu/de/theater/contact/':
		case 'https://antrepriza.eu/ru/theater/contact/':
			return true;
		default:
			plays.map(play => {
				if (
					`https://antrepriza.eu/de/plays/${play.suffix}/` === url ||
					`https://antrepriza.eu/ru/plays/${play.suffix}/` === url
				)
					return true;
			});
			return false;
	}
}

// https://astro.build/config
export default defineConfig({
	site: 'https://antrepriza.eu',
	redirects: {
		// '/admin/repetitions/': '/admin?page=/repetitions',
		// '/admin/performances/': '/admin?page=/performances',
		// '/admin/stages/': '/admin?page=/stages',
		// '/admin/plays/': '/admin?page=/plays',
		// '/admin/tickets/': '/admin?page=/tickets',
		// '/admin/whatsapp/': '/admin?page=/whatsapp',
	},
	integrations: [
		react(),
		vue({
			appEntrypoint: '@components/vue/vue-entry',
		}),
		icon(),
		sitemap({
			filter: page =>
				page !== 'https://antrepriza.eu/404/' &&
				page !== 'https://antrepriza.eu/ru/404/' &&
				page !== 'https://antrepriza.eu/de/404/' &&
				page !== 'https://antrepriza.eu/admin/' &&
				page !== 'https://antrepriza.eu/ru/newsletter/' &&
				page !== 'https://antrepriza.eu/de/newsletter/',
			// i18n: {
			// 	defaultLocale: 'ru',
			// 	locales: {
			// 		ru: 'ru-RU',
			// 		de: 'de-DE',
			// 	},
			// },
			serialize(item) {
				if (isNoIndex(item.url)) return undefined;
				if (isEvents(item.url)) {
					let actualEvent = isActualEvent(item.url);
					item.changefreq = actualEvent ? 'weekly' : 'yearly';
					item.lastmod = now;
					item.priority = 0.5;
				}
				if (isVerySpecialPage(item.url)) {
					item.changefreq = 'weekly';
					item.lastmod = now;
					item.priority = 0.9;
				}
				if (isSpecialPage(item.url)) {
					item.changefreq = 'monthly';
					item.lastmod = now;
					item.priority = 0.7;
				}
				return item;
			},
		}),
	],
});
