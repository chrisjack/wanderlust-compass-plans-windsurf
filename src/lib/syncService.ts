import { supabase } from '@/integrations/supabase/client';
import { offlineStorage } from './offlineStorage';
import { toast } from '@/components/ui/use-toast';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: number;
  lastSyncTime: number;
}

class SyncService {
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private statusListeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    this.setupOnlineOfflineListeners();
  }

  private setupOnlineOfflineListeners() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private async handleOnline() {
    console.log('Connection restored - starting sync');
    await offlineStorage.setOnlineStatus(true);
    this.notifyStatusListeners();
    await this.syncPendingOperations();
  }

  private async handleOffline() {
    console.log('Connection lost - switching to offline mode');
    await offlineStorage.setOnlineStatus(false);
    this.notifyStatusListeners();
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const isOnline = await offlineStorage.isOnline();
    const pendingOperations = await offlineStorage.getPendingOperationsCount();
    const lastSyncTime = await offlineStorage.getLastSyncTimestamp();

    return {
      isOnline,
      isSyncing: this.syncInProgress,
      pendingOperations,
      lastSyncTime,
    };
  }

  onStatusChange(listener: (status: SyncStatus) => void) {
    this.statusListeners.push(listener);
    return () => {
      const index = this.statusListeners.indexOf(listener);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  private async notifyStatusListeners() {
    const status = await this.getSyncStatus();
    this.statusListeners.forEach(listener => listener(status));
  }

  async syncPendingOperations(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return;
    }

    const isOnline = await offlineStorage.isOnline();
    if (!isOnline) {
      console.log('Offline - skipping sync');
      return;
    }

    this.syncInProgress = true;
    await this.notifyStatusListeners();

    try {
      const pendingOps = await offlineStorage.getPendingOperations();
      console.log(`Syncing ${pendingOps.length} pending operations`);

      for (const op of pendingOps) {
        try {
          await this.processPendingOperation(op);
          await offlineStorage.removePendingOperation(op.id);
        } catch (error) {
          console.error(`Failed to process operation ${op.id}:`, error);
          op.retryCount++;
          
          // Remove operation if it has been retried too many times
          if (op.retryCount >= 3) {
            await offlineStorage.removePendingOperation(op.id);
            toast({
              title: "Sync Error",
              description: `Failed to sync ${op.type} operation after 3 attempts`,
              variant: "destructive",
            });
          }
        }
      }

      await offlineStorage.updateLastSyncTimestamp();
      await this.notifyStatusListeners();

      if (pendingOps.length > 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${pendingOps.length} operations`,
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync with server",
        variant: "destructive",
      });
    } finally {
      this.syncInProgress = false;
      await this.notifyStatusListeners();
    }
  }

  private async processPendingOperation(op: any): Promise<void> {
    const { type, table, data } = op;

    switch (table) {
      case 'trips':
        await this.syncTripOperation(type, data);
        break;
      case 'notes':
        await this.syncNoteOperation(type, data);
        break;
      case 'columns':
        await this.syncColumnOperation(type, data);
        break;
      default:
        throw new Error(`Unknown table: ${table}`);
    }
  }

  private async syncTripOperation(type: string, data: any): Promise<void> {
    switch (type) {
      case 'CREATE':
        const { data: newTrip, error } = await supabase
          .from('planner_trips')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        
        // Update local storage with the real ID
        await offlineStorage.saveTrip(newTrip, false);
        break;

      case 'UPDATE':
        const { error: updateError } = await supabase
          .from('planner_trips')
          .update(data)
          .eq('id', data.id);
        
        if (updateError) throw updateError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('planner_trips')
          .delete()
          .eq('id', data.id);
        
        if (deleteError) throw deleteError;
        break;
    }
  }

  private async syncNoteOperation(type: string, data: any): Promise<void> {
    switch (type) {
      case 'CREATE':
        const { data: newNote, error } = await supabase
          .from('planner_notes')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        await offlineStorage.saveNote(newNote, false);
        break;

      case 'UPDATE':
        const { error: updateError } = await supabase
          .from('planner_notes')
          .update(data)
          .eq('id', data.id);
        
        if (updateError) throw updateError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('planner_notes')
          .delete()
          .eq('id', data.id);
        
        if (deleteError) throw deleteError;
        break;
    }
  }

  private async syncColumnOperation(type: string, data: any): Promise<void> {
    switch (type) {
      case 'CREATE':
        const { data: newColumn, error } = await supabase
          .from('planner_columns')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        await offlineStorage.saveColumn(newColumn, false);
        break;

      case 'UPDATE':
        const { error: updateError } = await supabase
          .from('planner_columns')
          .update(data)
          .eq('id', data.id);
        
        if (updateError) throw updateError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('planner_columns')
          .delete()
          .eq('id', data.id);
        
        if (deleteError) throw deleteError;
        break;
    }
  }

  // Optimistic operations for immediate UI feedback
  async createTripOptimistic(tripData: any): Promise<string> {
    const offlineId = `offline_${Date.now()}_${Math.random()}`;
    const trip = {
      ...tripData,
      id: offlineId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to local storage immediately
    await offlineStorage.saveTrip(trip, true);

    // Add to pending operations
    await offlineStorage.addPendingOperation({
      type: 'CREATE',
      table: 'trips',
      data: tripData,
    });

    await this.notifyStatusListeners();

    // Try to sync immediately if online
    const isOnline = await offlineStorage.isOnline();
    if (isOnline) {
      this.syncPendingOperations();
    }

    return offlineId;
  }

  async updateTripOptimistic(id: string, updates: any): Promise<void> {
    // Update local storage immediately
    const existingTrip = await offlineStorage.getTrip(id);
    if (existingTrip) {
      const updatedTrip = {
        ...existingTrip,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await offlineStorage.saveTrip(updatedTrip, true);
    }

    // Add to pending operations
    await offlineStorage.addPendingOperation({
      type: 'UPDATE',
      table: 'trips',
      data: { id, ...updates },
    });

    await this.notifyStatusListeners();

    // Try to sync immediately if online
    const isOnline = await offlineStorage.isOnline();
    if (isOnline) {
      this.syncPendingOperations();
    }
  }

  async deleteTripOptimistic(id: string): Promise<void> {
    // Remove from local storage immediately
    await offlineStorage.deleteTrip(id);

    // Add to pending operations
    await offlineStorage.addPendingOperation({
      type: 'DELETE',
      table: 'trips',
      data: { id },
    });

    await this.notifyStatusListeners();

    // Try to sync immediately if online
    const isOnline = await offlineStorage.isOnline();
    if (isOnline) {
      this.syncPendingOperations();
    }
  }

  // Start periodic sync
  startPeriodicSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncPendingOperations();
    }, intervalMs);
  }

  // Stop periodic sync
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Initialize the service
  async init(): Promise<void> {
    await offlineStorage.init();
    await this.notifyStatusListeners();
    this.startPeriodicSync();
  }
}

export const syncService = new SyncService(); 