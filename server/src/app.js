import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

app.use(helmet());
app.use(
  cors({
    origin: clientOrigins && clientOrigins.length > 0 ? clientOrigins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
  })
);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'fixra-api',
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
