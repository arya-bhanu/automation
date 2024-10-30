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
	// Launch the browser
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	// Navigate to the desired URL
	await page.goto(url);

	// Evaluate the performance metrics to get resource sizes
	const documentSize = await page.evaluate(() => {
		// Get all resource entries
		const resources = performance.getEntriesByType('resource');

		// Calculate total size
		let totalSize = 0;
		resources.forEach((resource) => {
			totalSize += resource.encodedBodySize; // Use decodedBodySize for uncompressed size
		});

		// Return the total size in bytes
		return totalSize;
	});

	// Log the document size
	console.log(`Total Document Size: ${documentSize} bytes`);
	fs.appendFileSync(reportsDir, documentSize.toString() + "\n", 'utf8');
	// Close the browser
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
