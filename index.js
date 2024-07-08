const fs = require('fs');
const path = require('path');
const resemble = require('resemblejs');

const baselineDir = './baseline-images';
const checkpointDir = './checkpoint-images';
const resultDir = './comparison-results';
const reportFile = path.join(resultDir, 'report.html');

// Ensure the result directory exists
if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir);
}

// Initialize comparison array and report content
let comparisons = [];
let reportContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Visual Comparison Report</title>
<style>
  body { font-family: Arial, sans-serif; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background-color: #f2f2f2; }
  tr:nth-child(even) { background-color: #f9f9f9; }
  img { width: 150px; }
</style>
</head>
<body>
<h1>Visual Comparison Report</h1>
<table>
  <thead>
    <tr>
      <th>Baseline Image</th>
      <th>Checkpoint Image</th>
      <th>Diff Image</th>
      <th>Mismatch Percentage</th>
    </tr>
  </thead>
  <tbody>`;

// Read directory contents of the baseline images
fs.readdir(baselineDir, (err, files) => {
  if (err) throw err;

  files.forEach((file, index, array) => {
    const baselineImagePath = path.join(baselineDir, file);
    const checkpointImagePath = path.join(checkpointDir, file);
    const diffImagePath = path.join(resultDir, 'diff-' + file);

    // Check if the checkpoint image exists
    if (!fs.existsSync(checkpointImagePath)) {
      console.error(`Checkpoint image not found for ${file}`);
      return;
    }

    resemble(baselineImagePath)
      .compareTo(checkpointImagePath)
      .ignoreColors()
      .onComplete((data) => {
        // Store comparison result
        comparisons.push({
          baseline: baselineImagePath,
          checkpoint: checkpointImagePath,
          diff: diffImagePath,
          mismatch: data.misMatchPercentage
        });

        // Save the diff image if differences are found
        if (data.misMatchPercentage > 0) {
          const diffImageBuffer = data.getBuffer();
          fs.writeFileSync(diffImagePath, diffImageBuffer);
        }

        // Check if all files have been processed
        if (comparisons.length === array.length) {
          // Generate report content
          comparisons.forEach(comp => {
            reportContent += `
              <tr>
                <td><img src="${comp.baseline}" alt="Baseline"></td>
                <td><img src="${comp.checkpoint}" alt="Checkpoint"></td>
                <td><img src="${comp.diff}" alt="Diff"></td>
                <td>${comp.mismatch}%</td>
              </tr>`;
          });

          // Finish report content
          reportContent += `
            </tbody>
          </table>
        </body>
        </html>`;

          // Write the report to a file
          fs.writeFileSync(reportFile, reportContent);
          console.log(`Report generated: ${reportFile}`);
        }
      });
  });
});