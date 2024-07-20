import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';
import plays from './src/data/plays.json';

let now = new Date();
const offset = now.getTimezoneOffset();
now = new Date(now.getTime() - offset * 60 * 1000);
// let strToday = now.toISOString().split('T')[0];

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
				if (`https://antrepriza.eu/de/plays/${play.suffix}` === url || `https://antrepriza.eu/ru/plays/${play.suffix}` === url) return true;
			});

			return false;
	}
}

// https://astro.build/config
export default defineConfig({
	site: 'https://antrepriza.eu',
	integrations: [
		react(),
		sitemap({
			filter: page =>
				page !== 'https://antrepriza.eu/404/' &&
				page !== 'https://antrepriza.eu/ru/404/' &&
				page !== 'https://antrepriza.eu/de/404/' &&
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
				if (isVerySpecialPage(item.url)) {
					item.changefreq = 'weekly';
					// item.lastmod = now;
					item.priority = 0.9;
				}
				if (isSpecialPage(item.url)) {
					item.changefreq = 'monthly';
					// item.lastmod = now;
					item.priority = 0.7;
				}
				return item;
			},
		}),
	],
	redirects: {
		'/afisha/': '/ru/program/',
		'/bilet/': '/ru/tickets/',
		'/contacts/': '/ru/contact/',

		'/program/': '/ru/program/',
		'/tickets/': '/ru/tickets/',
		'/support/': '/ru/support/',
		'/impressum/': '/ru/impressum/',
		'/gallery/': '/ru/gallery/',
	},
});
