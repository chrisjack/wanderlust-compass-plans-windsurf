import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema for offline storage
interface PlannerOfflineDB extends DBSchema {
  trips: {
    key: string;
    value: {
      id: string;
      title: string;
      description?: string | null;
      column_id: string;
      trip_id?: string | null;
      user_id: string;
      departureDate?: string | null;
      created_at: string;
      updated_at: string;
      isOffline: boolean;
      offlineId?: string;
    };
    indexes: { 'by-user': string; 'by-offline': string };
  };
  notes: {
    key: string;
    value: {
      id: string;
      trip_id: string;
      title?: string | null;
      content: string;
      user_id: string;
      created_at: string;
      updated_at: string;
      isOffline: boolean;
      offlineId?: string;
    };
    indexes: { 'by-trip': string; 'by-offline': string };
  };
  columns: {
    key: string;
    value: {
      id: string;
      title: string;
      position: number;
      user_id: string;
      created_at: string;
      updated_at: string;
      isOffline: boolean;
      offlineId?: string;
    };
    indexes: { 'by-user': string; 'by-offline': string };
  };
  pendingOperations: {
    key: string;
    value: {
      id: string;
      type: 'CREATE' | 'UPDATE' | 'DELETE';
      table: 'trips' | 'notes' | 'columns';
      data: any;
      timestamp: number;
      retryCount: number;
    };
    indexes: { 'by-timestamp': number };
  };
  syncMetadata: {
    key: string;
    value: {
      id: string;
      lastSyncTimestamp: number;
      isOnline: boolean;
      pendingOperationsCount: number;
    };
  };
}

class OfflineStorage {
  private db: IDBPDatabase<PlannerOfflineDB> | null = null;
  private dbName = 'planner-offline-db';
  private version = 1;
  private changeListeners: ((table: string) => void)[] = [];

  async init(): Promise<void> {
    try {
      this.db = await openDB<PlannerOfflineDB>(this.dbName, this.version, {
        upgrade(db) {
          // Create trips store
          const tripsStore = db.createObjectStore('trips', { keyPath: 'id' });
          tripsStore.createIndex('by-user', 'user_id');
          tripsStore.createIndex('by-offline', 'isOffline');

          // Create notes store
          const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
          notesStore.createIndex('by-trip', 'trip_id');
          notesStore.createIndex('by-offline', 'isOffline');

          // Create columns store
          const columnsStore = db.createObjectStore('columns', { keyPath: 'id' });
          columnsStore.createIndex('by-user', 'user_id');
          columnsStore.createIndex('by-offline', 'isOffline');

          // Create pending operations store
          const pendingStore = db.createObjectStore('pendingOperations', { keyPath: 'id' });
          pendingStore.createIndex('by-timestamp', 'timestamp');

          // Create sync metadata store
          db.createObjectStore('syncMetadata', { keyPath: 'id' });
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  // Add change listener
  onChange(listener: (table: string) => void) {
    this.changeListeners.push(listener);
    return () => {
      const index = this.changeListeners.indexOf(listener);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }

  // Notify listeners of changes
  private notifyChange(table: string) {
    this.changeListeners.forEach(listener => listener(table));
  }

  async isOnline(): Promise<boolean> {
    if (!this.db) await this.init();
    const metadata = await this.db!.get('syncMetadata', 'status');
    return metadata?.isOnline ?? navigator.onLine;
  }

  async setOnlineStatus(isOnline: boolean): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('syncMetadata', {
      id: 'status',
      isOnline,
      lastSyncTimestamp: Date.now(),
      pendingOperationsCount: await this.getPendingOperationsCount(),
    });
  }

  // Trip operations
  async saveTrip(trip: any, isOffline = false): Promise<void> {
    if (!this.db) await this.init();
    const tripData = {
      ...trip,
      isOffline,
      offlineId: isOffline ? `offline_${Date.now()}_${Math.random()}` : undefined,
    };
    await this.db!.put('trips', tripData);
    this.notifyChange('trips');
  }

  async getTrips(userId: string): Promise<any[]> {
    if (!this.db) await this.init();
    return await this.db!.getAllFromIndex('trips', 'by-user', userId);
  }

  async getTrip(id: string): Promise<any | null> {
    if (!this.db) await this.init();
    return await this.db!.get('trips', id);
  }

  async deleteTrip(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('trips', id);
    this.notifyChange('trips');
  }

  // Note operations
  async saveNote(note: any, isOffline = false): Promise<void> {
    if (!this.db) await this.init();
    const noteData = {
      ...note,
      isOffline,
      offlineId: isOffline ? `offline_${Date.now()}_${Math.random()}` : undefined,
    };
    await this.db!.put('notes', noteData);
    this.notifyChange('notes');
  }

  async getNotes(tripId: string): Promise<any[]> {
    if (!this.db) await this.init();
    return await this.db!.getAllFromIndex('notes', 'by-trip', tripId);
  }

  async deleteNote(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('notes', id);
    this.notifyChange('notes');
  }

  // Column operations
  async saveColumn(column: any, isOffline = false): Promise<void> {
    if (!this.db) await this.init();
    const columnData = {
      ...column,
      isOffline,
      offlineId: isOffline ? `offline_${Date.now()}_${Math.random()}` : undefined,
    };
    await this.db!.put('columns', columnData);
    this.notifyChange('columns');
  }

  async getColumns(userId: string): Promise<any[]> {
    if (!this.db) await this.init();
    return await this.db!.getAllFromIndex('columns', 'by-user', userId);
  }

  // Pending operations
  async addPendingOperation(operation: {
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    table: 'trips' | 'notes' | 'columns';
    data: any;
  }): Promise<void> {
    if (!this.db) await this.init();
    const pendingOp = {
      id: `op_${Date.now()}_${Math.random()}`,
      ...operation,
      timestamp: Date.now(),
      retryCount: 0,
    };
    await this.db!.add('pendingOperations', pendingOp);
    this.notifyChange('pendingOperations');
  }

  async getPendingOperations(): Promise<any[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('pendingOperations');
  }

  async removePendingOperation(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('pendingOperations', id);
    this.notifyChange('pendingOperations');
  }

  async getPendingOperationsCount(): Promise<number> {
    if (!this.db) await this.init();
    return await this.db!.count('pendingOperations');
  }

  // Sync metadata
  async getLastSyncTimestamp(): Promise<number> {
    if (!this.db) await this.init();
    const metadata = await this.db!.get('syncMetadata', 'status');
    return metadata?.lastSyncTimestamp || 0;
  }

  async updateLastSyncTimestamp(): Promise<void> {
    if (!this.db) await this.init();
    const metadata = await this.db!.get('syncMetadata', 'status');
    await this.db!.put('syncMetadata', {
      id: 'status',
      isOnline: metadata?.isOnline ?? true,
      lastSyncTimestamp: Date.now(),
      pendingOperationsCount: await this.getPendingOperationsCount(),
    });
  }

  // Clear all data (for testing or reset)
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.clear('trips');
    await this.db!.clear('notes');
    await this.db!.clear('columns');
    await this.db!.clear('pendingOperations');
    await this.db!.clear('syncMetadata');
  }
}

export const offlineStorage = new OfflineStorage(); 