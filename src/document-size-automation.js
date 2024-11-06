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
	{
		name: 'backoffice-modul',
		url: 'http://localhost:3000/skripsi/backoffice/',
	},
];

const calculateSizeHTML = async (url, name) => {
	const reportsDir = path.join(
		__dirname,
		'reports-document-size',
		IS_CLIENT === 'true' ? 'client-side' : 'server-side',
		`${name}.txt`
	);
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	// Intercept network requests
	await page.setRequestInterception(true);
	page.on('request', (request) => {
		request.continue();
	});

	// Listen for responses
	page.on('response', async (response) => {
		const url = response.url();
		const contentType = response.headers()['content-type'];

		// Check if the response is HTML
		if (contentType && contentType.includes('text/html')) {
			const html = await response.text();
			const htmlSize = Buffer.byteLength(html, 'utf8'); // Get size in bytes
			console.log(`HTML Document Size for ${url}: ${htmlSize} bytes`);
			fs.appendFileSync(reportsDir, htmlSize.toString() + '\n', 'utf8');
		}
	});

	// Navigate to the desired URL
	await page.goto(url, {
		waitUntil: 'load', // Wait until the load event fires
	});

	await browser.close();
};

async function main() {
	// Create reports directory if it doesn't exist
	const reportsDir = path.join(
		__dirname,
		'reports-document-size',
		IS_CLIENT === 'true' ? 'client-side' : 'server-side'
	);
	if (!fs.existsSync(reportsDir)) {
		fs.mkdirSync(reportsDir, { recursive: true });
	}

	// Run Lighthouse for each URL 30 times
	for (let i = 0; i < 30; i++) {
		console.log(`Calculate Size Document ${i + 1}...`);
		for (const url of urls) {
			await calculateSizeHTML(url.url, url.name);
		}
	}
	console.log('All audits completed.');
}

main();
