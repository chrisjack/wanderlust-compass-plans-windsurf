import PDFDocument from 'pdfkit';
import fs from 'fs';

// Create a document
const doc = new PDFDocument();

// Pipe its output somewhere, like to a file
doc.pipe(fs.createWriteStream('sample_flight.pdf'));

// Add the content
doc.fontSize(16).text('FLIGHT CONFIRMATION', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('Booking Reference: ABC123');
doc.moveDown();

doc.text('FLIGHT DETAILS');
doc.text('Airline: United Airlines');
doc.text('Flight Number: UA456');
doc.moveDown();

doc.text('OUTBOUND FLIGHT');
doc.text('From: San Francisco (SFO)');
doc.text('Terminal: 3');
doc.text('Date: March 15, 2024');
doc.text('Departure Time: 10:30 AM');
doc.moveDown();

doc.text('To: New York (JFK)');
doc.text('Terminal: 4');
doc.text('Date: March 15, 2024');
doc.text('Arrival Time: 7:15 PM');
doc.moveDown();

doc.text('Passenger Information:');
doc.text('Name: John Doe');
doc.text('Seat: 12A');
doc.text('Class: Economy');
doc.moveDown();

doc.text('Please arrive at the airport at least 2 hours before departure.');
doc.text('Check-in closes 45 minutes before departure.');

// Finalize PDF file
doc.end(); 