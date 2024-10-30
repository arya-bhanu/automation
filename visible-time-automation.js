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

const calculatePaintTimeBackoffice = async (url, name) => {
	const reportsDir = path.join(
		__dirname,
		'reports-visible-time',
		IS_CLIENT === 'true' ? 'client-side' : 'server-side',
		`${name}.txt`
	);
	// Launch the browser
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	// Start timer
	const startTime = performance.now();

	// Navigate to the desired URL
	await page.goto(url);

	// Wait for the content with id="data-row" to be rendered
	await page.waitForSelector('#data-row', { visible: true });

	// Stop timer
	const endTime = performance.now();
	const renderTime = endTime - startTime;

	const fixedRenderTime = renderTime.toFixed(2);

	// Log the time taken
	console.log(`Time taken to render #data-row: ${fixedRenderTime} ms`);

	fs.appendFileSync(reportsDir, fixedRenderTime + '\n', 'utf8');

	// Close the browser
	await browser.close();
};
const calculatePaintTimePortal = async (url, name) => {
	const reportsDir = path.join(
		__dirname,
		'reports-visible-time',
		IS_CLIENT === 'true' ? 'client-side' : 'server-side',
		`${name}.txt`
	);
	// Launch the browser
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	// Start timer
	const startTime = performance.now();

	// Navigate to the desired URL
	await page.goto(url);

	// Wait for the content with id="data-row" to be rendered
	await page.waitForSelector('#data-image');

	// Stop timer
	const endTime = performance.now();
	const renderTime = endTime - startTime;

	const fixedRenderTime = renderTime.toFixed(2);

	// Log the time taken
	console.log(`Time taken to render #data-image: ${fixedRenderTime} ms`);

	fs.appendFileSync(reportsDir, fixedRenderTime + '\n', 'utf8');

	// Close the browser
	await browser.close();
};

async function main() {
	const reportsDir = path.join(
		__dirname,
		'reports-visible-time',
		IS_CLIENT === 'true' ? 'client-side' : 'server-side'
	);
	if (!fs.existsSync(reportsDir)) {
		fs.mkdirSync(reportsDir, { recursive: true });
	}

	for (let i = 0; i < 30; i++) {
		urls.forEach(async (el) => {
			if (el.name === 'home-portal') {
                console.log(`Calculate Time until Visible of Portal Home Page ${i + 1}...`);
				await calculatePaintTimePortal(el.url, el.name);
			}
			if (el.name === 'backoffice-modul') {
                console.log(`Calculate Time until Visible of Backoffice Page ${i + 1}...`);
				await calculatePaintTimeBackoffice(el.url, el.name);
			}
		});
	}
	console.log('All audits completed.');
}

main().catch((err) => console.error(err));
