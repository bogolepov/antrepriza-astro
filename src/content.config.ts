import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const plays = defineCollection({
	loader: glob({
		base: './src/content/plays',
		pattern: '**/*.md',
	}),
});

const people = defineCollection({
	loader: glob({
		base: './src/content/people',
		pattern: '**/*.md',
	}),
});

export const collections = {
	plays,
	people,
};
