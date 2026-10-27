import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiRouter } from './http/routes.js';
import { errorHandler } from './http/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;

const app = express();
app.use(
  cors({
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/api', createApiRouter());

const webDist = path.join(__dirname, '../../web/dist');
app.use(express.static(webDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(webDist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Pulse Track API http://localhost:${PORT}`);
});
