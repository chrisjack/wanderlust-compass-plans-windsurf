const pdf = require('html-pdf');

const content = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { text-align: center; }
    .section { margin: 15px 0; }
  </style>
</head>
<body>
  <h1>FLIGHT CONFIRMATION</h1>
  
  <div class="section">
    <p><strong>Booking Reference:</strong> ABC123</p>
  </div>

  <div class="section">
    <h2>FLIGHT DETAILS</h2>
    <p><strong>Airline:</strong> United Airlines</p>
    <p><strong>Flight Number:</strong> UA456</p>
  </div>

  <div class="section">
    <h2>OUTBOUND FLIGHT</h2>
    <p><strong>From:</strong> San Francisco (SFO)</p>
    <p><strong>Terminal:</strong> 3</p>
    <p><strong>Date:</strong> March 15, 2024</p>
    <p><strong>Departure Time:</strong> 10:30 AM</p>
  </div>

  <div class="section">
    <p><strong>To:</strong> New York (JFK)</p>
    <p><strong>Terminal:</strong> 4</p>
    <p><strong>Date:</strong> March 15, 2024</p>
    <p><strong>Arrival Time:</strong> 7:15 PM</p>
  </div>

  <div class="section">
    <h2>Passenger Information</h2>
    <p><strong>Name:</strong> John Doe</p>
    <p><strong>Seat:</strong> 12A</p>
    <p><strong>Class:</strong> Economy</p>
  </div>

  <div class="section">
    <p>Please arrive at the airport at least 2 hours before departure.</p>
    <p>Check-in closes 45 minutes before departure.</p>
  </div>
</body>
</html>
`;

const options = {
  format: 'Letter',
  border: {
    top: '0.5in',
    right: '0.5in',
    bottom: '0.5in',
    left: '0.5in'
  }
};

pdf.create(content, options).toFile('sample_flight.pdf', function(err, res) {
  if (err) {
    console.error('Error creating PDF:', err);
    return;
  }
  console.log('PDF created successfully:', res.filename);
}); 