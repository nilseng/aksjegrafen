/**
 * Minimal in-memory TTL cache for server-rendered pages and counts. Entries expire
 * after ttlMs; when the map is full the oldest-inserted entry is evicted. Heroku
 * cycles dynos daily, so long TTLs effectively mean "once per dyno per day".
 */
export class TtlCache<V> {
  private store = new Map<string, { value: V; expires: number }>();

  constructor(private ttlMs: number, private max = 500) {}

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expires < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: V): void {
    if (this.store.size >= this.max && !this.store.has(key)) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }
}
