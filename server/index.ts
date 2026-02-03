import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyRouter } from './proxy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3001;
const AVIATION_EDGE_API_KEY = process.env.AVIATION_EDGE_API_KEY || process.env.VITE_AVIATION_EDGE_API_KEY;

const app = express();

// API proxy routes
app.use('/api/proxy', createProxyRouter({ apiKey: AVIATION_EDGE_API_KEY }));

// Serve static files from dist/ in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
