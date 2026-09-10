import { Problem } from '../models/types';

type JobHandler = (data: any) => Promise<void>;

interface JobItem {
  id: string;
  name: string;
  data: any;
  addedAt: number;
}

class AsyncJobQueue {
  private queue: JobItem[] = [];
  private handlers: Map<string, JobHandler> = new Map();
  private isProcessing = false;

  constructor() {
    console.log('[Async Processing] BullMQ/Worker queue interface initialized.');
  }

  public registerWorker(name: string, handler: JobHandler) {
    this.handlers.set(name, handler);
    console.log(`[Async Worker Registered] Worker handler attached for job: "${name}"`);
  }

  public async add(name: string, data: any) {
    const job: JobItem = {
      id: 'job_' + Math.random().toString(36).substring(2, 9),
      name,
      data,
      addedAt: Date.now()
    };
    this.queue.push(job);
    console.log(`[Job Queue] Enqueued job: ${job.id} (${name}). Processing asynchronously...`);
    
    // Trigger async worker without blocking caller
    setImmediate(() => {
      this.processQueue();
    });

    return { id: job.id, name };
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;

      const handler = this.handlers.get(job.name);
      if (handler) {
        try {
          const start = Date.now();
          await handler(job.data);
          console.log(`[Job Worker Completed] Job ${job.id} (${job.name}) processed in ${Date.now() - start}ms`);
        } catch (error) {
          console.error(`[Job Worker Error] Failed processing job ${job.id}:`, error);
        }
      } else {
        console.warn(`[Job Queue Warning] No registered handler for job type: ${job.name}`);
      }
    }

    this.isProcessing = false;
  }
}

export const jobQueue = new AsyncJobQueue();
