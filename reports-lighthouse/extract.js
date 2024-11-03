import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function extractData(filePath) {
	const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

	const extractedData = {
		firstContentfulPaint: data.audits['first-contentful-paint'].numericValue,
		totalBlockingTime: data.audits['total-blocking-time'].numericValue,
		speedIndex: data.audits['speed-index'].numericValue,
		largestContentfulPaint:
			data.audits['largest-contentful-paint'].numericValue,
		cumulativeLayoutShift: data.audits['cumulative-layout-shift'].numericValue,
		performanceScore: data.categories.performance.score,
	};

	return extractedData;
}

function processDirectory(directoryPath, name) {
	let dataJson = [];
	const workbook = xlsx.utils.book_new();
	fs.readdirSync(directoryPath).forEach((file) => {
		const filePath = path.join(directoryPath, file);
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			processDirectory(filePath);
		} else if (path.extname(filePath) === '.json') {
			const extractedData = extractData(filePath);
			dataJson.push(extractedData);
		}
	});
	const worksheet = xlsx.utils.json_to_sheet(dataJson);
	xlsx.utils.book_append_sheet(workbook, worksheet, `Sheet${name}`);
	xlsx.writeFile(workbook, `output_${name}.xlsx`);
}

const reportsDir = path.join(__dirname, 'server-side', 'home-portal');

console.log(reportsDir);

processDirectory(reportsDir, 'server-side-po');
