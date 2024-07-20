import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

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
				page !== 'https://antrepriza.eu/newsletter/',
		}),
	],
	redirects: {
		'/afisha/': '/ru/program/',
		'/bilet/': '/ru/tickets/',
		'/program/': '/ru/program/',
		'/tickets/': '/ru/tickets/',
		'/support/': '/ru/support/',
		'/impressum/': '/ru/impressum/',
		'/gallery/': '/ru/gallery/',
	},
});
