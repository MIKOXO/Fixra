import mongoose from 'mongoose';

const deadLetterLogSchema = new mongoose.Schema({
  queue: { type: String, required: true },
  jobId: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  error: { type: String, required: true },
  failedAt: { type: Date, default: Date.now },
});

export default mongoose.model('DeadLetterLog', deadLetterLogSchema);
