import api from './api';

export interface PendingOperation {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = 'citrus_offline_queue';

class SyncService {
  private queue: PendingOperation[] = [];
  private isProcessing = false;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
    }
  }

  private loadQueue() {
    const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (saved) {
      try {
        this.queue = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse offline queue', e);
        this.queue = [];
      }
    }
  }

  private saveQueue() {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
  }

  enqueue(method: 'POST' | 'PUT' | 'DELETE', url: string, data?: any) {
    const operation: PendingOperation = {
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      method,
      url,
      data,
      timestamp: Date.now()
    };
    this.queue.push(operation);
    this.saveQueue();
    
    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) return;

    this.isProcessing = true;
    console.log(`[SyncService] Processing ${this.queue.length} pending operations...`);

    const failedOperations: PendingOperation[] = [];

    for (const op of [...this.queue]) {
      try {
        switch (op.method) {
          case 'POST':
            await api.post(op.url, op.data);
            break;
          case 'PUT':
            await api.put(op.url, op.data);
            break;
          case 'DELETE':
            await api.delete(op.url, { data: op.data });
            break;
        }
        console.log(`[SyncService] Successfully synced: ${op.method} ${op.url}`);
      } catch (error: any) {
        console.error(`[SyncService] Sync failed for ${op.method} ${op.url}:`, error.message);
        
        // If it's a 4xx error (except 429), it might be an invalid request, don't retry indefinitely
        if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
          console.warn(`[SyncService] Skipping invalid operation: ${op.id}`);
        } else {
          // It's a network error or 5xx, keep it in queue for later
          failedOperations.push(op);
        }
      }
    }

    this.queue = failedOperations;
    this.saveQueue();
    this.isProcessing = false;

    if (this.queue.length === 0) {
      console.log('[SyncService] All operations synced successfully.');
    }
  }

  getPendingCount() {
    return this.queue.length;
  }
}

export const syncService = new SyncService();
