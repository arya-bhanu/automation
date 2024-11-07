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

async function measureTimeToElement(url, name) {
	const reportsDir = path.join(
		__dirname,
		'reports-time-to-element',
		IS_CLIENT === 'true' ? 'client-side' : 'server-side',
		`${name}.txt`
	);
	const browser = await puppeteer.launch({
		headless: false,
		args: [`--window-size=1920,1080`],
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});
	const page = await browser.newPage();
	await page.goto(url);
	for (let i = 0; i < 30; i++) {
		await page.reload({ waitUntil: ['load'] });
		const contentStart = Date.now();
		await page.waitForSelector(`#data-image`, { visible: true });
		await page.waitForSelector(`#data-image-benefit`, { visible: true });
		await page.waitForSelector(`#data-image-program`, { visible: true });
		await page.waitForSelector(`#data-image-class`, { visible: true });
		await page.waitForSelector(`#data-image-user`, { visible: true });
		await page.waitForSelector(`#data-image-partners`, { visible: true });
		const contentVisibleTime = Date.now();
		const timeDifference = contentVisibleTime - contentStart;
		console.log(`Attempt: ${i + 1}`);
		console.log(
			`Time between first content and #data-image also #data-image-class visible ${timeDifference} ms`
		);
		fs.appendFileSync(reportsDir, timeDifference + '\n', 'utf8');
		await new Promise((resolve) => setTimeout(resolve, 3000));
	}

	await browser.close();
}

async function main() {
	const reportsDir = path.join(
		__dirname,
		'reports-time-to-element',
		IS_CLIENT === 'true' ? 'client-side' : 'server-side'
	);

	if (!fs.existsSync(reportsDir)) {
		fs.mkdirSync(reportsDir, { recursive: true });
	}

	// Run measurement
	for (const url of urls) {
		await measureTimeToElement(url.url, url.name);
	}
	console.log('All audits completed.');
}

main();
