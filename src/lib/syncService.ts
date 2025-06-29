import { offlineStorage } from './offlineStorage';
import { supabase } from '@/integrations/supabase/client';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: number;
  lastSyncTime: number;
}

class SyncService {
  private onlineStatus = navigator.onLine;
  private syncInProgress = false;
  private changeListeners: ((status: 'online' | 'offline' | 'syncing') => void)[] = [];

  constructor() {
    this.setupNetworkListeners();
    this.initializeOnlineStatus();
  }

  // Add status change listener
  onStatusChange(listener: (status: 'online' | 'offline' | 'syncing') => void) {
    this.changeListeners.push(listener);
    return () => {
      const index = this.changeListeners.indexOf(listener);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }

  // Notify listeners of status changes
  private notifyStatusChange(status: 'online' | 'offline' | 'syncing') {
    this.changeListeners.forEach(listener => listener(status));
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.onlineStatus = true;
      this.notifyStatusChange('online');
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.onlineStatus = false;
      this.notifyStatusChange('offline');
    });
  }

  private async initializeOnlineStatus() {
    await offlineStorage.setOnlineStatus(this.onlineStatus);
  }

  async isOnline(): Promise<boolean> {
    return await offlineStorage.isOnline();
  }

  async syncPendingOperations(): Promise<void> {
    if (this.syncInProgress || !this.onlineStatus) return;

    this.syncInProgress = true;
    this.notifyStatusChange('syncing');

    try {
      const pendingOps = await offlineStorage.getPendingOperations();
      
      for (const op of pendingOps) {
        try {
          await this.processPendingOperation(op);
          await offlineStorage.removePendingOperation(op.id);
        } catch (error) {
          console.error(`Failed to process pending operation ${op.id}:`, error);
          op.retryCount++;
          
          // Remove operation if it has been retried too many times
          if (op.retryCount >= 3) {
            await offlineStorage.removePendingOperation(op.id);
          }
        }
      }

      await offlineStorage.updateLastSyncTimestamp();
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.syncInProgress = false;
      this.notifyStatusChange(this.onlineStatus ? 'online' : 'offline');
    }
  }

  private async processPendingOperation(op: any): Promise<void> {
    const { type, table, data } = op;

    switch (table) {
      case 'trips':
        await this.processTripOperation(type, data);
        break;
      case 'notes':
        await this.processNoteOperation(type, data);
        break;
      case 'columns':
        await this.processColumnOperation(type, data);
        break;
    }
  }

  private async processTripOperation(type: string, data: any): Promise<void> {
    switch (type) {
      case 'CREATE':
        const { data: newTrip, error: createError } = await supabase
          .from('planner_trips')
          .insert(data)
          .select()
          .single();
        
        if (createError) throw createError;
        
        // Update offline storage with the real ID
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

  private async processNoteOperation(type: string, data: any): Promise<void> {
    switch (type) {
      case 'CREATE':
        const { data: newNote, error: createError } = await supabase
          .from('planner_trip_texts')
          .insert(data)
          .select()
          .single();
        
        if (createError) throw createError;
        await offlineStorage.saveNote(newNote, false);
        break;

      case 'UPDATE':
        const { error: updateError } = await supabase
          .from('planner_trip_texts')
          .update(data)
          .eq('id', data.id);
        
        if (updateError) throw updateError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('planner_trip_texts')
          .delete()
          .eq('id', data.id);
        
        if (deleteError) throw deleteError;
        break;
    }
  }

  private async processColumnOperation(type: string, data: any): Promise<void> {
    switch (type) {
      case 'CREATE':
        const { data: newColumn, error: createError } = await supabase
          .from('planner_columns')
          .insert(data)
          .select()
          .single();
        
        if (createError) throw createError;
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

  // Optimistic trip operations
  async createTripOptimistic(tripData: any): Promise<string> {
    const offlineId = `offline_${Date.now()}_${Math.random()}`;
    const trip = {
      ...tripData,
      id: offlineId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to offline storage immediately
    await offlineStorage.saveTrip(trip, true);

    // Add to pending operations
    await offlineStorage.addPendingOperation({
      type: 'CREATE',
      table: 'trips',
      data: tripData,
    });

    // Try to sync immediately if online
    if (this.onlineStatus) {
      this.syncPendingOperations();
    }

    return offlineId;
  }

  async updateTripOptimistic(tripId: string, updates: any): Promise<void> {
    // Update offline storage immediately
    const existingTrip = await offlineStorage.getTrip(tripId);
    if (existingTrip) {
      const updatedTrip = {
        ...existingTrip,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await offlineStorage.saveTrip(updatedTrip, existingTrip.isOffline);
    }

    // Add to pending operations
    await offlineStorage.addPendingOperation({
      type: 'UPDATE',
      table: 'trips',
      data: { id: tripId, ...updates },
    });

    // Try to sync immediately if online
    if (this.onlineStatus) {
      this.syncPendingOperations();
    }
  }

  async deleteTripOptimistic(tripId: string): Promise<void> {
    // Remove from offline storage immediately
    await offlineStorage.deleteTrip(tripId);

    // Add to pending operations
    await offlineStorage.addPendingOperation({
      type: 'DELETE',
      table: 'trips',
      data: { id: tripId },
    });

    // Try to sync immediately if online
    if (this.onlineStatus) {
      this.syncPendingOperations();
    }
  }

  // Optimistic note operations
  async createNoteOptimistic(noteData: any): Promise<string> {
    const offlineId = `offline_${Date.now()}_${Math.random()}`;
    const note = {
      ...noteData,
      id: offlineId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await offlineStorage.saveNote(note, true);

    await offlineStorage.addPendingOperation({
      type: 'CREATE',
      table: 'notes',
      data: noteData,
    });

    if (this.onlineStatus) {
      this.syncPendingOperations();
    }

    return offlineId;
  }

  async updateNoteOptimistic(noteId: string, updates: any): Promise<void> {
    const existingNotes = await offlineStorage.getNotes(updates.trip_id || '');
    const existingNote = existingNotes.find(n => n.id === noteId);
    
    if (existingNote) {
      const updatedNote = {
        ...existingNote,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await offlineStorage.saveNote(updatedNote, existingNote.isOffline);
    }

    await offlineStorage.addPendingOperation({
      type: 'UPDATE',
      table: 'notes',
      data: { id: noteId, ...updates },
    });

    if (this.onlineStatus) {
      this.syncPendingOperations();
    }
  }

  async deleteNoteOptimistic(noteId: string): Promise<void> {
    await offlineStorage.deleteNote(noteId);

    await offlineStorage.addPendingOperation({
      type: 'DELETE',
      table: 'notes',
      data: { id: noteId },
    });

    if (this.onlineStatus) {
      this.syncPendingOperations();
    }
  }
}

export const syncService = new SyncService(); 