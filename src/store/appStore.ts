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
  TaskType,
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

  getCheckInWithDetails: (checkInId: string) => any;
  getTaskWithDetails: (taskId: string) => any;
  getDashboardStats: () => any;
  getActiveCheckIns: () => any[];
  getTasksForToday: () => any[];
  getUnreadMessages: () => Message[];
  getUnreadAlerts: () => Alert[];

  addOwner: (owner: Omit<Owner, 'id'>) => string;
  addPet: (pet: Omit<Pet, 'id'>) => string;
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => string;
  addCheckInWithDetails: (data: {
    pet: Omit<Pet, 'id' | 'ownerId'>;
    owner: Omit<Owner, 'id'>;
    checkIn: Omit<CheckIn, 'id' | 'petId' | 'ownerId' | 'status'>;
  }) => string;
  updateCheckIn: (id: string, updates: Partial<CheckIn>) => void;
  completeCheckIn: (id: string) => void;

  addTask: (task: Omit<FeedingTask, 'id'>) => string;
  updateTask: (id: string, updates: Partial<FeedingTask>) => void;
  completeTask: (id: string, foodAmount?: number, notes?: string, notifyOwner?: boolean) => void;

  addHealthRecord: (record: Omit<HealthRecord, 'id'>) => string;

  addMessage: (message: Omit<Message, 'id' | 'isRead' | 'timestamp'>) => string;
  markMessageAsRead: (id: string) => void;

  updateInventory: (id: string, quantity: number) => void;

  updateSchedule: (employeeId: string, date: string, updates: Partial<Schedule>) => void;

  payBill: (id: string, paymentMethod: string) => void;

  addAlert: (alert: Omit<Alert, 'id' | 'isRead'>) => string;
  markAlertAsRead: (id: string) => void;

  setCurrentStore: (storeId: string) => void;
}

const generatePetPhoto = (species: string, breed: string) => {
  const seed = `${species}-${breed}-${Date.now()}`;
  const type = species === 'dog' ? '可爱的小狗' : species === 'cat' ? '可爱的猫咪' : '可爱的宠物';
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${type}，${breed}，专业宠物摄影，柔和光线，高清照片`)}&image_size=square`;
};

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

  getCheckInWithDetails: (checkInId) => {
    const state = get();
    const checkIn = state.checkIns.find(c => c.id === checkInId);
    if (!checkIn) return undefined;
    
    const pet = state.pets.find(p => p.id === checkIn.petId);
    const owner = state.owners.find(o => o.id === checkIn.ownerId);
    const store = state.stores.find(s => s.id === checkIn.storeId);
    
    if (!pet || !owner || !store) return undefined;
    
    return { ...checkIn, pet, owner, store };
  },

  getTaskWithDetails: (taskId) => {
    const state = get();
    const task = state.feedingTasks.find(t => t.id === taskId);
    if (!task) return undefined;
    
    const checkIn = state.checkIns.find(c => c.id === task.checkInId);
    const pet = checkIn ? state.pets.find(p => p.id === checkIn.petId) : undefined;
    
    if (!checkIn || !pet) return { ...task, checkIn: null, pet: null };
    
    return { ...task, pet, checkIn };
  },

  getDashboardStats: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    
    const activeCheckIns = state.checkIns.filter(c => c.status === 'active');
    const todayCheckIns = state.checkIns.filter(c => c.checkInDate === today);
    const todayCheckOuts = state.checkIns.filter(c => c.expectedCheckOutDate === today && c.status === 'active');
    const pendingTasks = state.feedingTasks.filter(t => t.scheduledTime.startsWith(today) && t.status === 'pending');
    const completedTasks = state.feedingTasks.filter(t => t.scheduledTime.startsWith(today) && t.status === 'completed');
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
        const pet = state.pets.find(p => p.id === checkIn.petId);
        const owner = state.owners.find(o => o.id === checkIn.ownerId);
        const store = state.stores.find(s => s.id === checkIn.storeId);
        if (!pet || !owner || !store) return null;
        return { ...checkIn, pet, owner, store };
      })
      .filter(Boolean) as any[];
  },

  getTasksForToday: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    return state.feedingTasks
      .filter(t => t.scheduledTime.startsWith(today))
      .map(task => {
        const checkIn = state.checkIns.find(c => c.id === task.checkInId);
        const pet = checkIn ? state.pets.find(p => p.id === checkIn.petId) : undefined;
        if (!checkIn || !pet) return { ...task, pet: null, checkIn: null };
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

  addOwner: (owner) => {
    const id = `owner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newOwner: Owner = { ...owner, id };
    set(state => ({ owners: [...state.owners, newOwner] }));
    return id;
  },

  addPet: (pet) => {
    const id = `pet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newPet: Pet = { 
      ...pet, 
      id,
      photoUrl: pet.photoUrl || generatePetPhoto(pet.species, pet.breed),
      vaccineRecords: pet.vaccineRecords || [],
    };
    set(state => ({ pets: [...state.pets, newPet] }));
    return id;
  },

  addCheckIn: (checkIn) => {
    const id = `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newCheckIn: CheckIn = { ...checkIn, id };
    set(state => ({ checkIns: [...state.checkIns, newCheckIn] }));
    return id;
  },

  addCheckInWithDetails: ({ pet, owner, checkIn }) => {
    const state = get();
    let ownerId = owner.id || '';
    if (!ownerId) {
      const existingOwner = state.owners.find(o => o.phone === owner.phone);
      if (existingOwner) {
        ownerId = existingOwner.id;
      } else {
        ownerId = get().addOwner(owner);
      }
    }

    const petId = get().addPet({ ...pet, ownerId });

    const checkInId = get().addCheckIn({
      ...checkIn,
      petId,
      ownerId,
      status: 'active',
    });

    const today = new Date().toISOString().split('T')[0];
    const taskTypes: { type: TaskType; time: string }[] = [
      { type: 'feeding', time: '07:00' },
      { type: 'water', time: '08:00' },
      { type: 'feeding', time: '12:00' },
      { type: 'walk', time: '13:00' },
      { type: 'feeding', time: '18:00' },
      { type: 'water', time: '19:00' },
      { type: 'cleaning', time: '20:00' },
    ];

    const currentUser = state.currentUserId;
    const inventoryFood = state.inventoryItems.find(i => i.type === 'food' && i.storeId === checkIn.storeId);

    taskTypes.forEach(tt => {
      get().addTask({
        checkInId,
        employeeId: currentUser,
        type: tt.type,
        scheduledTime: `${checkIn.checkInDate}T${tt.time}:00`,
        status: 'pending',
        inventoryId: tt.type === 'feeding' ? inventoryFood?.id : undefined,
      });
    });

    return checkInId;
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

  addTask: (task) => {
    const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newTask: FeedingTask = { ...task, id };
    set(state => ({ feedingTasks: [...state.feedingTasks, newTask] }));
    return id;
  },

  updateTask: (id, updates) => {
    set(state => ({
      feedingTasks: state.feedingTasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  },

  completeTask: (id, foodAmount, notes, notifyOwner = false) => {
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
          ? { ...t, status: 'completed', actualTime, foodAmount, notes, notifyOwner }
          : t
      ),
    }));

    if (notifyOwner) {
      const checkIn = state.checkIns.find(c => c.id === task.checkInId);
      const pet = checkIn ? state.pets.find(p => p.id === checkIn.petId) : undefined;
      const employee = state.employees.find(e => e.id === state.currentUserId);
      
      if (checkIn && pet && employee) {
        const taskNames: Record<string, string> = {
          feeding: '喂食',
          water: '喂水',
          cleaning: '清洁',
          walk: '遛放',
          bath: '洗澡',
          medication: '喂药',
        };
        const taskName = taskNames[task.type] || '照护';
        let content = `已完成${taskName}任务。`;
        if (foodAmount) {
          content += ` 食量：${foodAmount}克。`;
        }
        if (notes) {
          content += ` 备注：${notes}`;
        }

        get().addMessage({
          checkInId: task.checkInId,
          senderType: 'staff',
          senderName: employee.name,
          content,
        });
      }
    }
  },

  addHealthRecord: (record) => {
    const id = `health-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newRecord: HealthRecord = { ...record, id };
    set(state => ({ healthRecords: [...state.healthRecords, newRecord] }));

    if (record.isAbnormal) {
      const state = get();
      const checkIn = state.checkIns.find(c => c.id === record.checkInId);
      const pet = checkIn ? state.pets.find(p => p.id === checkIn.petId) : undefined;
      
      if (checkIn && pet) {
        get().addAlert({
          checkInId: record.checkInId,
          type: 'health',
          title: `${pet.name} 健康异常`,
          description: `体温${record.temperature}°C，精神状态异常，请及时关注。`,
          priority: 'high',
        });
      }
    }

    return id;
  },

  addMessage: (message) => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newMessage: Message = {
      ...message,
      id,
      isRead: false,
      timestamp: new Date().toISOString(),
    };
    set(state => ({ messages: [...state.messages, newMessage] }));
    return id;
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

  updateSchedule: (employeeId, date, updates) => {
    set(state => {
      const existingIndex = state.schedules.findIndex(
        s => s.employeeId === employeeId && s.date === date
      );
      
      if (existingIndex >= 0) {
        return {
          schedules: state.schedules.map((s, i) => 
            i === existingIndex ? { ...s, ...updates } : s
          ),
        };
      } else {
        const newSchedule: Schedule = {
          id: `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          employeeId,
          date,
          shiftType: updates.shiftType || 'morning',
          notes: updates.notes || '',
          handoverNotes: updates.handoverNotes || '',
          ...updates,
        };
        return {
          schedules: [...state.schedules, newSchedule],
        };
      }
    });
  },

  payBill: (id, paymentMethod) => {
    const today = new Date().toISOString().split('T')[0];
    set(state => ({
      bills: state.bills.map(b => 
        b.id === id 
          ? { ...b, paymentStatus: 'paid', paymentDate: today, paymentMethod }
          : b
      ),
    }));
  },

  addAlert: (alert) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newAlert: Alert = { ...alert, id, isRead: false };
    set(state => ({ alerts: [...state.alerts, newAlert] }));
    return id;
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
