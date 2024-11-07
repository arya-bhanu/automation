import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IS_CLIENT = process.env.IS_CLIENT;

const urls = [
	{
		name: 'home-portal',
		url: 'http://localhost:3000/skripsi/home/',
	},
];

const baseDir = path.join(
	__dirname,
	'reports-tracing-performance',
	IS_CLIENT === 'true' ? 'client-side' : 'server-side'
);

async function trackPerformance(url, name) {
	const browser = await puppeteer.launch({
		headless: false,
		args: [`--window-size=1920,1080`],
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});
	const page = await browser.newPage();
	const newDir = path.join(baseDir, name);
	if (!fs.existsSync(newDir)) {
		fs.mkdirSync(newDir, { recursive: true });
	}
	await page.goto(url);
	for (let i = 0; i < 30; i++) {
		console.log('Tracking start peformance attempt: ', i + 1);
		await page.tracing.start({
			path: path.join(newDir, `output_${i + 1}_${name}.json`),
			screenshots: true,
		});
		await page.reload();
		await page.waitForSelector(`#data-image`, { visible: true });
		await page.waitForSelector(`#data-image-class`, { visible: true });
		await page.tracing.stop();
		await new Promise((resolve) => setTimeout(resolve, 1500));
	}
	await browser.close();
}

async function main() {
	if (!fs.existsSync(baseDir)) {
		fs.mkdirSync(baseDir, { recursive: true });
	}

	for (const url of urls) {
		await trackPerformance(url.url, url.name);
	}
	console.log('All audits completed.');
}

main();
