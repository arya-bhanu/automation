import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import dotenv from 'dotenv';

dotenv.config();
// List of URLs to audit
const urls = [
	{
		name: 'home-portal',
		url: 'http://localhost:3000/skripsi/home/',
	},
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IS_CLIENT = process.env.IS_CLIENT;

// Function to run Lighthouse
async function runLighthouse(url, name, i) {
	const pageResultDir = path.join(
		__dirname,
		'reports-lighthouse',
		IS_CLIENT === 'true' ? 'client-side' : 'server-side',
		name
	);
	if (!fs.existsSync(pageResultDir)) {
		fs.mkdirSync(pageResultDir, { recursive: true });
	}

	const browser = await puppeteer.launch({ headless: true });
	const { port } = new URL(browser.wsEndpoint());
	const flag = {
		logLevel: 'info',
		output: 'html',
		onlyCategories: ['performance'],
		port: port,
	};

	const runnerResult = await lighthouse(url, flag, desktopConfig);

	// Save HTML report
	const reportHtml = runnerResult.report;
	const reportHtmlPath = path.join(pageResultDir, `report_${i}.html`);
	console.log(reportHtmlPath);
	fs.writeFileSync(reportHtmlPath, reportHtml);

	// Save JSON report
	const reportJson = runnerResult.lhr;
	const reportJsonPath = path.join(pageResultDir, `report_${i}.json`);
	fs.writeFileSync(reportJsonPath, JSON.stringify(reportJson, null, 2));
	await browser.close();
	console.log(`Report generated for ${url}`);
}

// Main function to run audits
async function main() {
	// Create reports directory if it doesn't exist
	const reportsDir = path.join(
		__dirname,
		'reports-lighthouse',
		IS_CLIENT === 'true' ? 'client-side' : 'server-side'
	);
	if (!fs.existsSync(reportsDir)) {
		fs.mkdirSync(reportsDir, { recursive: true });
	}

	// Run Lighthouse for each URL 30 times
	for (let i = 0; i < 30; i++) {
		console.log(`Running Lighthouse audit ${i + 1}...`);
		for (const url of urls) {
			await runLighthouse(url.url, url.name, i + 1);
		}
	}
	console.log('All audits completed.');
}

main().catch((err) => console.error(err));
