import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	i18n: {
		defaultLocale: 'ru',
		locales: ['de', 'ru'],
		routing: {
			prefixDefaultLocale: false,
			redirectToDefaultLocale: true,
		},
		fallback: {
			de: 'ru',
		},
	},
	integrations: [react()],
	redirects: {
		'/afisha/': '/ru/programm/',
		'/bilet/': '/ru/tickets/',

		'/programm/': '/ru/programm/',
		'/tickets/': '/ru/tickets/',
		'/support/': '/ru/support/',
		'/programm/': '/ru/programm/',
		'/impressum/': '/ru/impressum/',
		'/gallery/': '/ru/gallery/',
	},
});
