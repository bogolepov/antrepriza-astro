import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	integrations: [react()],
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
