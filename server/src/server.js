import 'dotenv/config';
import http from 'node:http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './sockets/index.js';

const port = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
