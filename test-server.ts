import express from 'express';
const app = express();
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.listen(3001, () => console.log('Test server running on port 3001'));