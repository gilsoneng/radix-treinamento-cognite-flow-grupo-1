
export class AbortError extends Error {
  public constructor(message = 'Aborted') {
    super(message);
    this.name = 'AbortError';
  }
}

type PendingTask<AsyncFn, AsyncFnResult> = {
  resolve: (result: AsyncFnResult) => void;
  reject: (error: unknown) => void;
  fn: AsyncFn;
  key?: string;
};

const DEFAULT_MAX_CONCURRENT_TASKS = 15;


export default class QueuedTaskRunner<
  AsyncFn extends () => Promise<AsyncFnResult>,
  AsyncFnResult = Awaited<ReturnType<AsyncFn>>,
> {
  private pendingTasks: PendingTask<AsyncFn, AsyncFnResult>[] = [];
  private currentPendingTasks = 0;

  public constructor(private readonly maxConcurrentTasks = DEFAULT_MAX_CONCURRENT_TASKS) {}

  public schedule(fn: AsyncFn, options: { key?: string } = {}): Promise<AsyncFnResult> {
    return new Promise((resolve, reject) => {
      if (options.key !== undefined) {
        this.pendingTasks
          .filter((task) => task.key === options.key)
          .forEach((task) => task.reject(new AbortError()));

        this.pendingTasks = this.pendingTasks.filter((task) => task.key !== options.key);
      }

      this.pendingTasks.push({ resolve, reject, fn, key: options.key });
      void this.attemptConsumingNextTask();
    });
  }

  public async attemptConsumingNextTask(): Promise<void> {
    if (this.pendingTasks.length === 0) return;
    if (this.currentPendingTasks >= this.maxConcurrentTasks) return;

    const pendingTask = this.pendingTasks.shift();
    if (pendingTask === undefined) {
      throw new Error('pendingTask is undefined, this should never happen');
    }

    this.currentPendingTasks++;
    const { fn, resolve, reject } = pendingTask;

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.currentPendingTasks--;
      void this.attemptConsumingNextTask();
    }
  }
}


export const cdfTaskRunner = new QueuedTaskRunner(DEFAULT_MAX_CONCURRENT_TASKS);
