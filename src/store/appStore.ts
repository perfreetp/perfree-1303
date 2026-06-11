import { create } from 'zustand';
import {
  Store,
  Owner,
  Pet,
  CheckIn,
  FeedingTask,
  HealthRecord,
  InventoryItem,
  Message,
  Employee,
  Schedule,
  Bill,
  Alert,
  CheckInWithDetails,
  TaskWithDetails,
  DashboardStats,
} from '../data/types';
import {
  stores as initialStores,
  owners as initialOwners,
  pets as initialPets,
  checkIns as initialCheckIns,
  feedingTasks as initialTasks,
  healthRecords as initialHealthRecords,
  inventoryItems as initialInventory,
  messages as initialMessages,
  employees as initialEmployees,
  schedules as initialSchedules,
  bills as initialBills,
  alerts as initialAlerts,
  occupancyData,
  revenueData,
} from '../data/mockData';

interface AppState {
  stores: Store[];
  owners: Owner[];
  pets: Pet[];
  checkIns: CheckIn[];
  feedingTasks: FeedingTask[];
  healthRecords: HealthRecord[];
  inventoryItems: InventoryItem[];
  messages: Message[];
  employees: Employee[];
  schedules: Schedule[];
  bills: Bill[];
  alerts: Alert[];
  currentStoreId: string;
  currentUserId: string;
  occupancyData: typeof occupancyData;
  revenueData: typeof revenueData;

  getCheckInWithDetails: (checkInId: string) => CheckInWithDetails | undefined;
  getTaskWithDetails: (taskId: string) => TaskWithDetails | undefined;
  getDashboardStats: () => DashboardStats;
  getActiveCheckIns: () => CheckInWithDetails[];
  getTasksForToday: () => TaskWithDetails[];
  getUnreadMessages: () => Message[];
  getUnreadAlerts: () => Alert[];

  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  updateCheckIn: (id: string, updates: Partial<CheckIn>) => void;
  completeCheckIn: (id: string) => void;

  updateTask: (id: string, updates: Partial<FeedingTask>) => void;
  completeTask: (id: string, foodAmount?: number, notes?: string) => void;

  addHealthRecord: (record: Omit<HealthRecord, 'id'>) => void;

  addMessage: (message: Omit<Message, 'id' | 'isRead' | 'timestamp'>) => void;
  markMessageAsRead: (id: string) => void;

  updateInventory: (id: string, quantity: number) => void;

  markAlertAsRead: (id: string) => void;

  setCurrentStore: (storeId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  stores: initialStores,
  owners: initialOwners,
  pets: initialPets,
  checkIns: initialCheckIns,
  feedingTasks: initialTasks,
  healthRecords: initialHealthRecords,
  inventoryItems: initialInventory,
  messages: initialMessages,
  employees: initialEmployees,
  schedules: initialSchedules,
  bills: initialBills,
  alerts: initialAlerts,
  currentStoreId: 'store-1',
  currentUserId: 'emp-1',
  occupancyData,
  revenueData,

  getCheckInWithDetails: (checkInId: string) => {
    const state = get();
    const checkIn = state.checkIns.find(c => c.id === checkInId);
    if (!checkIn) return undefined;
    
    const pet = state.pets.find(p => p.id === checkIn.petId)!;
    const owner = state.owners.find(o => o.id === checkIn.ownerId)!;
    const store = state.stores.find(s => s.id === checkIn.storeId)!;
    
    return { ...checkIn, pet, owner, store };
  },

  getTaskWithDetails: (taskId: string) => {
    const state = get();
    const task = state.feedingTasks.find(t => t.id === taskId);
    if (!task) return undefined;
    
    const checkIn = state.checkIns.find(c => c.id === task.checkInId)!;
    const pet = state.pets.find(p => p.id === checkIn.petId)!;
    
    return { ...task, pet, checkIn };
  },

  getDashboardStats: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    
    const activeCheckIns = state.checkIns.filter(c => c.status === 'active');
    const todayCheckIns = state.checkIns.filter(c => c.checkInDate === today);
    const todayCheckOuts = state.checkIns.filter(c => c.expectedCheckOutDate === today && c.status === 'active');
    const pendingTasks = state.feedingTasks.filter(t => t.status === 'pending');
    const completedTasks = state.feedingTasks.filter(t => t.status === 'completed');
    const unreadAlerts = state.alerts.filter(a => !a.isRead);
    
    const totalCages = state.stores.reduce((sum, s) => sum + s.totalCages, 0);
    const occupancyRate = totalCages > 0 ? Math.round((activeCheckIns.length / totalCages) * 100) : 0;
    
    return {
      totalPets: activeCheckIns.length,
      todayCheckIns: todayCheckIns.length,
      todayCheckOuts: todayCheckOuts.length,
      pendingTasks: pendingTasks.length,
      completedTasks: completedTasks.length,
      alerts: unreadAlerts.length,
      occupancyRate,
    };
  },

  getActiveCheckIns: () => {
    const state = get();
    return state.checkIns
      .filter(c => c.status === 'active')
      .map(checkIn => {
        const pet = state.pets.find(p => p.id === checkIn.petId)!;
        const owner = state.owners.find(o => o.id === checkIn.ownerId)!;
        const store = state.stores.find(s => s.id === checkIn.storeId)!;
        return { ...checkIn, pet, owner, store };
      });
  },

  getTasksForToday: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    return state.feedingTasks
      .filter(t => t.scheduledTime.startsWith(today))
      .map(task => {
        const checkIn = state.checkIns.find(c => c.id === task.checkInId)!;
        const pet = state.pets.find(p => p.id === checkIn.petId)!;
        return { ...task, pet, checkIn };
      })
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  },

  getUnreadMessages: () => {
    return get().messages.filter(m => !m.isRead);
  },

  getUnreadAlerts: () => {
    return get().alerts.filter(a => !a.isRead);
  },

  addCheckIn: (checkIn) => {
    const newCheckIn: CheckIn = {
      ...checkIn,
      id: `checkin-${Date.now()}`,
    };
    set(state => ({ checkIns: [...state.checkIns, newCheckIn] }));
  },

  updateCheckIn: (id, updates) => {
    set(state => ({
      checkIns: state.checkIns.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  },

  completeCheckIn: (id) => {
    const today = new Date().toISOString().split('T')[0];
    set(state => ({
      checkIns: state.checkIns.map(c => 
        c.id === id ? { ...c, status: 'completed', actualCheckOutDate: today } : c
      ),
    }));
  },

  updateTask: (id, updates) => {
    set(state => ({
      feedingTasks: state.feedingTasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  },

  completeTask: (id, foodAmount, notes) => {
    const state = get();
    const task = state.feedingTasks.find(t => t.id === id);
    if (!task) return;

    const actualTime = new Date().toISOString().slice(0, 16);
    
    if (task.inventoryId && foodAmount) {
      const inventory = state.inventoryItems.find(i => i.id === task.inventoryId);
      if (inventory) {
        const deductionKg = foodAmount / 1000;
        set(state => ({
          inventoryItems: state.inventoryItems.map(i => 
            i.id === task.inventoryId 
              ? { ...i, quantity: Math.max(0, i.quantity - deductionKg), lastUpdated: actualTime }
              : i
          ),
        }));
      }
    }

    set(state => ({
      feedingTasks: state.feedingTasks.map(t => 
        t.id === id 
          ? { ...t, status: 'completed', actualTime, foodAmount, notes }
          : t
      ),
    }));
  },

  addHealthRecord: (record) => {
    const newRecord: HealthRecord = {
      ...record,
      id: `health-${Date.now()}`,
    };
    set(state => ({ healthRecords: [...state.healthRecords, newRecord] }));
  },

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      isRead: false,
      timestamp: new Date().toISOString(),
    };
    set(state => ({ messages: [...state.messages, newMessage] }));
  },

  markMessageAsRead: (id) => {
    set(state => ({
      messages: state.messages.map(m => m.id === id ? { ...m, isRead: true } : m),
    }));
  },

  updateInventory: (id, quantity) => {
    set(state => ({
      inventoryItems: state.inventoryItems.map(i => 
        i.id === id 
          ? { ...i, quantity, lastUpdated: new Date().toISOString().slice(0, 16) }
          : i
      ),
    }));
  },

  markAlertAsRead: (id) => {
    set(state => ({
      alerts: state.alerts.map(a => a.id === id ? { ...a, isRead: true } : a),
    }));
  },

  setCurrentStore: (storeId) => {
    set({ currentStoreId: storeId });
  },
}));
