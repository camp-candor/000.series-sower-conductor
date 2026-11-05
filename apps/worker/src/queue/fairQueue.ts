export interface ExecutionJob {
  jobId: string;
  sceneId: string;
  artistId: string;
  idempotencyKey: string;
  ttlMs: number;
  enqueuedAtMs: number;
  attemptCount: number;
  maxAttempts: number;
}

export class FairQueue {
  private jobs: ExecutionJob[] = [];

  constructor(initialJobs: ExecutionJob[] = []) {
    this.jobs = [...initialJobs];
  }

  enqueue(job: ExecutionJob): boolean {
    const exists = this.jobs.some(
      (j) => j.jobId === job.jobId || j.idempotencyKey === job.idempotencyKey
    );
    if (exists) {
      return false;
    }
    this.jobs.push(job);
    return true;
  }

  dequeueNextFair(lastArtistId: string | null): ExecutionJob | null {
    if (this.jobs.length === 0) {
      return null;
    }

    if (!lastArtistId) {
      return this.jobs.shift() || null;
    }

    const fairIndex = this.jobs.findIndex((j) => j.artistId !== lastArtistId);
    if (fairIndex !== -1) {
      const [selected] = this.jobs.splice(fairIndex, 1);
      return selected;
    }

    return this.jobs.shift() || null;
  }

  requeuePriority(job: ExecutionJob): void {
    this.jobs.unshift(job);
  }

  remove(jobId: string): boolean {
    const idx = this.jobs.findIndex((j) => j.jobId === jobId);
    if (idx !== -1) {
      this.jobs.splice(idx, 1);
      return true;
    }
    return false;
  }

  peek(): ExecutionJob | null {
    return this.jobs.length > 0 ? this.jobs[0] : null;
  }

  size(): number {
    return this.jobs.length;
  }

  hasIdempotencyKey(key: string): boolean {
    return this.jobs.some((j) => j.idempotencyKey === key);
  }

  getAllJobs(): ExecutionJob[] {
    return [...this.jobs];
  }

  toJSON(): ExecutionJob[] {
    return this.jobs;
  }

  fromJSON(data: ExecutionJob[]): void {
    this.jobs = Array.isArray(data) ? [...data] : [];
  }
}
