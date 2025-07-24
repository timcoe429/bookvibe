const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Log everything
console.log('Starting minimal server...');
console.log('Port:', PORT);
console.log('Environment:', process.env.NODE_ENV);

// Respond to EVERYTHING with success
app.use('*', (req, res) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  res.json({ 
    status: 'success',
    message: 'BookVibe Minimal Server Working!',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
}); 