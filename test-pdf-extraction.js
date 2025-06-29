import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

async function testPdfExtraction() {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync('sample_flight.pdf');
    
    console.log('Starting PDF extraction...');
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(dataBuffer);
    const pages = pdfDoc.getPages();
    
    console.log('PDF loaded successfully!');
    console.log(`Number of pages: ${pages.length}`);
    
    // Note: pdf-lib doesn't extract text, but we can verify the PDF structure
    console.log('PDF structure verified - document is valid');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPdfExtraction(); 