import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import theater from '../../../../src/data/theater.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, 'mjml');
const outputDir = path.join(__dirname, './html');

if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

const staticData = {
	theater_url: theater.our_website_link,
	theater_url_text: theater.our_website_text,
	facebook_url: theater.social_pages?.find(p => p.name === 'Facebook')?.url || '#',
	instagram_url: theater.social_pages?.find(p => p.name === 'Instagram')?.url || '#',
	youtube_url: theater.social_pages?.find(p => p.name === 'YouTube')?.url || '#',
};

console.log('Static data для MJML:', staticData);

const buildAll = () => {
	const files = readdirSync(templatesDir).filter(f => f.endsWith('.mjml'));

	for (const file of files) {
		const mjmlPath = path.join(templatesDir, file);
		let source = readFileSync(mjmlPath, 'utf-8');

		// 1.Самое важное: сначала полностью разворачиваем includes вручную
		source = source.replace(/<mj-include\s+path=["'](.*?)["']\s*\/>/g, (match, p) => {
			const includePath = path.join(templatesDir, p);
			return existsSync(includePath) ? readFileSync(includePath, 'utf-8') : match;
		});

		// 2. Заменяем ТОЛЬКО {{{static}}} — обычные {{dynamic}} НЕ трогаем!
		let mjmlProcessed = source.replace(/{{{([^}]+)}}}/g, (match, key) => {
			const trimmedKey = key.trim();
			return staticData[trimmedKey] !== undefined ? staticData[trimmedKey] : match; // если переменной нет — оставляем как было
		});

		// Теперь применяем Handlebars ко всему развёрнутому шаблону
		// const template = Handlebars.compile(source);
		// const mjmlProcessed = template(staticData);

		// 3. MJML → HTML
		const { html, errors } = mjml2html(mjmlProcessed, {
			minify: false,
			beautify: false,
		});

		if (errors.length > 0) {
			console.error(`❌ MJML ошибки в ${file}:`, errors);
			continue;
		}

		const outputPath = path.join(outputDir, file.replace('.mjml', '.html'));
		writeFileSync(outputPath, html, { encoding: 'utf-8', flag: 'w' });
		console.log(`✅ Сгенерирован: ${file.replace('.mjml', '.html')}`);
	}

	console.log('\n🎉 Готово!');
};

buildAll();
