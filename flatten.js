import { createSVGWindow } from 'svgdom';
import fs from 'fs';
import { SVG, registerWindow } from '@svgdotjs/svg.js';

// Function to flatten an SVG file
async function flattenSVG(inputFile, outputFile) {
  try {
    // Read the input SVG file
    const svgData = fs.readFileSync(inputFile, 'utf-8');

    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);

    // Load the SVG into svg.js
    const draw = SVG(svgData);

    // Flatten the SVG
    draw.flatten();

    // Write the flattened SVG to the output file
    fs.writeFileSync(outputFile, draw.svg(), 'utf-8');
    console.log(`Flattened SVG saved to ${outputFile}`);
  } catch (error) {
    console.error('Error processing SVG:', error.message);
    process.exit(1);
  }
}

// Get the input file from the command line arguments
const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Please provide an input SVG file as the first command-line argument.');
  process.exit(1);
}

// Define the output file
const outputFile = 'output.svg';

// Run the flattenSVG function
flattenSVG(inputFile, outputFile);