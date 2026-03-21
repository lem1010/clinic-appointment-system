type AsyncTask<T> = () => Promise<T>;

class KeyedMutex {
  private queues = new Map<string, Promise<void>>();

  async runExclusive<T>(key: string, task: AsyncTask<T>): Promise<T> {
    const previous = this.queues.get(key) ?? Promise.resolve();

    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });

    this.queues.set(
      key,
      previous.then(() => current)
    );

    await previous;

    try {
      return await task();
    } finally {
      release();

      if (this.queues.get(key) === current) {
        this.queues.delete(key);
      }
    }
  }
}

export const appointmentCreationMutex = new KeyedMutex();