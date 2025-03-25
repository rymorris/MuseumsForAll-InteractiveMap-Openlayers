const fs = require('fs');
const path = require('path');

const directoryPath = './states'; // path to your JSON files
const outputFile = 'combined.json';

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  const jsonFiles = files.filter(file => file.endsWith('.json'));
  const combinedArray = [];

  jsonFiles.forEach(file => {
    const filePath = path.join(directoryPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(data);
    if (data.institutions) {
        combinedArray.push(...data.institutions);
        } else {
            combinedArray.push(...data);
        }
  });

  fs.writeFileSync(outputFile, JSON.stringify(combinedArray, null, 2));
  console.log(`Combined ${jsonFiles.length} files into ${outputFile}`);
});