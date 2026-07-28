import { logger } from "@/config/logger";

/**
 * Minimal in-process job queue for fire-and-forget background work (sending an
 * email, recomputing a cache) so it never blocks the HTTP response. Jobs run
 * sequentially with retry + backoff. This is deliberately dependency-free;
 * swapping in BullMQ later only requires reimplementing `enqueue`.
 */

export type JobHandler<T> = (payload: T) => Promise<void>;

interface QueuedJob {
  name: string;
  run: () => Promise<void>;
  attempts: number;
  maxAttempts: number;
}

class JobQueue {
  private queue: QueuedJob[] = [];
  private processing = false;
  private readonly handlers = new Map<string, JobHandler<unknown>>();

  register<T>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler as JobHandler<unknown>);
  }

  enqueue<T>(name: string, payload: T, maxAttempts = 3): void {
    const handler = this.handlers.get(name);
    if (!handler) {
      logger.error({ name }, "No handler registered for job");
      return;
    }
    this.queue.push({ name, run: () => handler(payload), attempts: 0, maxAttempts });
    void this.process();
  }

  private async process(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const job = this.queue.shift()!;
        job.attempts += 1;
        try {
          await job.run();
        } catch (err) {
          if (job.attempts < job.maxAttempts) {
            logger.warn({ err, name: job.name, attempt: job.attempts }, "Job failed; will retry");
            const delay = 500 * 2 ** (job.attempts - 1);
            setTimeout(() => {
              this.queue.push(job);
              void this.process();
            }, delay).unref();
          } else {
            logger.error({ err, name: job.name }, "Job failed permanently");
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  get size(): number {
    return this.queue.length;
  }
}

export const jobQueue = new JobQueue();
