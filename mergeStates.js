import { readdir, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const directoryPath = './statesJSON'; // path to your JSON files
const outputFile = './combined.json';

readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  const jsonFiles = files.filter(file => file.endsWith('.json'));
  const combinedArray = [];

  jsonFiles.forEach(file => {
    const filePath = join(__dirname, directoryPath, file);
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    console.log(data);
    if (data.institutions) {
      combinedArray.push(...data.institutions);
    } else {
      combinedArray.push(...data);
    }
  });

  writeFileSync(join(__dirname, outputFile), JSON.stringify(combinedArray, null, 2));
  console.log(`Combined ${jsonFiles.length} files into ${outputFile}`);
});