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

const calculateLoadTime = async (url, name) => {
	const reportsDir = path.join(
		__dirname,
		'reports-load-time',
		IS_CLIENT === 'true' ? 'client-side' : 'server-side',
		`${name}.json`
	);
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.goto(url);

	const performanceTiming = JSON.parse(
		await page.evaluate(() => JSON.stringify(window.performance.timing))
	);

	let reports = [];

	// Check if the file exists
	if (fs.existsSync(reportsDir)) {
		// Read the existing file
		const fileContent = fs.readFileSync(reportsDir, 'utf8');
		try {
			// Parse the existing content
			reports = JSON.parse(fileContent);
		} catch (err) {
			console.error('Error parsing JSON:', err);
		}
	}

	reports.push(performanceTiming);

	fs.writeFileSync(reportsDir, JSON.stringify(reports, null, 2), 'utf8');
	await browser.close();
};

async function main() {
	// Create reports directory if it doesn't exist
	const reportsDir = path.join(
		__dirname,
		'reports-load-time',
		IS_CLIENT === 'true' ? 'client-side' : 'server-side'
	);
	if (!fs.existsSync(reportsDir)) {
		fs.mkdirSync(reportsDir, { recursive: true });
	}

	// Run Lighthouse for each URL 30 times
	for (let i = 0; i < 30; i++) {
		console.log(`Measure load time page ${i + 1}...`);
		for (const url of urls) {
			await calculateLoadTime(url.url, url.name);
		}
	}
	console.log('All audits completed.');
}

main();
