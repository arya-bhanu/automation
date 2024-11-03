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
		id: 'data-image',
	},
	{
		name: 'backoffice-modul',
		url: 'http://localhost:3000/skripsi/backoffice/',
		id: 'data-row',
	},
];

async function measureTimeToElement(url, id, name) {
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
	// Loop to refresh the page 30 times
	for (let i = 0; i < 30; i++) {
		// Perform a hard refresh
		await page.reload({ waitUntil: ['load'] });
		const contentStart = Date.now();
		await page.waitForSelector(`#${id}`, { visible: true });
		// Wait for the content with id="content" to load
		const contentVisibleTime = Date.now();

		const timeDifference = contentVisibleTime - contentStart;

		console.log(`Attempt: ${i + 1}`);
		console.log(
			`Time between first content and #${id} visible ${timeDifference} ms`
		);
		fs.appendFileSync(reportsDir, timeDifference + '\n', 'utf8');

		// Wait for 1000 milliseconds (1 second)
		await new Promise((resolve) => setTimeout(resolve, 3000));
	}

	await browser.close();
}

// Example usage
// Replace with your target URL
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
		await measureTimeToElement(url.url, url.id, url.name);
	}
	console.log('All audits completed.');
}

main();
