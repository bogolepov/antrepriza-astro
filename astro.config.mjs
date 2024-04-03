import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	i18n: {
		defaultLocale: 'ru',
		locales: ['de', 'ru'],
		routing: {
			prefixDefaultLocale: true,
		},
	},
});
