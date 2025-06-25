const fs = require('fs');
const pdfParse = require('pdf-parse');

async function testPdfExtraction() {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync('sample_flight.pdf');
    
    console.log('Starting PDF extraction...');
    
    // Parse the PDF
    const data = await pdfParse(dataBuffer);
    
    // Log the extracted text
    console.log('Extracted text:');
    console.log('----------------------------------------');
    console.log(data.text);
    console.log('----------------------------------------');
    console.log(`Number of pages: ${data.numpages}`);
    console.log(`PDF Version: ${data.info.PDFFormatVersion}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPdfExtraction(); 