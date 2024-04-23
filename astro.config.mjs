import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	i18n: {
		defaultLocale: 'ru',
		locales: ['de', 'ru'],
		routing: {
			prefixDefaultLocale: true,
		},
	},
	integrations: [react()],
});
