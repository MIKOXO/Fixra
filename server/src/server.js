import 'dotenv/config';
import http from 'node:http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './sockets/index.js';
import { notificationWorker } from './queues/processors/notification.processor.js';
import { escalationWorker } from './queues/processors/escalation.processor.js';

const port = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  if (notificationWorker) {
    console.log('Notification worker started');
  }
  if (escalationWorker) {
    console.log('Escalation worker started');
  }

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
