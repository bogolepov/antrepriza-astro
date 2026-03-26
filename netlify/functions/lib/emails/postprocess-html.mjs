// netlify/functions/lib/emails/postprocess-html.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import theater from '../../../../src/data/theater.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlDir = path.join(__dirname, 'html');

const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

const replacements = {
	theater_url: theater.our_website_link,
	theater_url_text: theater.our_website_text,
	facebook_url: theater.social_pages?.find(p => p.name === 'Facebook')?.url || '#',
	instagram_url: theater.social_pages?.find(p => p.name === 'Instagram')?.url || '#',
	youtube_url: theater.social_pages?.find(p => p.name === 'YouTube')?.url || '#',
	review_google_url: theater.review_links.find(p => p.name === 'Google')?.link || '#',
	review_facebook_url: theater.review_links.find(p => p.name === 'Facebook')?.link || '#',
};

console.log('Замены, которые будут применены:');
console.log(replacements);

const processFile = filePath => {
	let content = fs.readFileSync(filePath, 'utf-8');
	let replaced = content;

	// Оптимизация только в production-режиме
	if (isProduction) {
		replaced = replaced
			// Удаляем HTML-комментарии
			// .replace(/<!--[\s\S]*?-->/g, '')
			// (опционально) убираем пробелы вокруг = в атрибутах
			// .replace(/\s*=\s*/g, '=')
			// Удаляем пустые style и class атрибуты
			.replace(/\s+(style|class)=""/g, '')
			// Удаляем множественные пробелы и табы
			.replace(/\s{2,}/g, ' ')
			// Удаляем пробелы между тегами (безопасно для inline-элементов)
			.replace(/>\s+</g, '><')
			// Удаляем лишние переносы строк
			.replace(/\n\s*\n/g, '\n');
	}

	// Первый проход — замена известных значений
	for (const [key, value] of Object.entries(replacements)) {
		const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const pattern = new RegExp(`{{{\\s*${escapedKey}\\s*}}}`, 'g');
		replaced = replaced.replace(pattern, value);
	}

	// Второй проход — поиск оставшихся {{{ ... }}}
	const leftoverPattern = /{{{[^}]*}}}/g;
	const leftovers = replaced.match(leftoverPattern) || [];

	if (leftovers.length > 0) {
		console.warn(`\n⚠️  В файле ${path.basename(filePath)} остались незаменённые плейсхолдеры:`);
		leftovers.forEach((match, i) => {
			console.warn(`  ${i + 1}. ${match}`);
		});
		console.warn('Проверьте, добавлены ли эти ключи в объект replacements.\n');
	}

	// Записываем результат (даже если были предупреждения)
	if (replaced !== content) {
		fs.writeFileSync(filePath, replaced, 'utf-8');
		console.log(`Обновлён: ${path.basename(filePath)}`);
	} else {
		console.log(`Без изменений: ${path.basename(filePath)}`);
	}

	// Возвращаем количество найденных "мусоров" — можно использовать для exit code, если нужно
	return leftovers.length;
};

const buildAll = () => {
	const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

	if (files.length === 0) {
		console.warn('Нет html-файлов в папке');
		return;
	}

	let totalLeftovers = 0;

	console.log(`Обрабатываем ${files.length} файлов...`);
	for (const file of files) {
		const fullPath = path.join(htmlDir, file);
		totalLeftovers += processFile(fullPath);
	}

	console.log('Пост-обработка завершена.');

	if (!totalLeftovers) console.log('Все известные плейсхолдеры заменены.');
};

buildAll();
