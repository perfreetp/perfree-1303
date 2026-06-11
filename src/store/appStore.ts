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
  FeedingPlan,
  AlertStatus,
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
  feedingPlans as initialFeedingPlans,
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
  feedingPlans: FeedingPlan[];
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
  getAvailableCages: (storeId: string) => string[];
  isCageOccupied: (storeId: string, cageNumber: string) => boolean;
  getPetHealthRecords: (checkInId: string) => any;
  getFeedingPlanForPet: (petId: string) => FeedingPlan | undefined;
  getFeedingPlanHistory: (petId: string) => FeedingPlan[];
  getCareOverview: () => any[];

  addOwner: (owner: Omit<Owner, 'id'>) => string;
  addPet: (pet: Omit<Pet, 'id'>) => string;
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => string;
  addCheckInWithDetails: (data: {
    pet: Omit<Pet, 'id' | 'ownerId'>;
    owner: Omit<Owner, 'id'>;
    checkIn: Omit<CheckIn, 'id' | 'petId' | 'ownerId' | 'status'>;
    feedingPlan?: Omit<FeedingPlan, 'id' | 'petId' | 'version' | 'effectiveFrom' | 'isActive'>;
  }) => { success: boolean; message?: string; checkInId?: string };
  updateCheckIn: (id: string, updates: Partial<CheckIn>) => void;
  completeCheckIn: (id: string) => void;

  addFeedingPlan: (plan: Omit<FeedingPlan, 'id'>) => string;
  updateFeedingPlan: (petId: string, updates: Partial<FeedingPlan>) => void;
  createFeedingPlanVersion: (petId: string, updates: Partial<FeedingPlan>, reason?: string) => string;
  applyFeedingPlanToPendingTasks: (petId: string) => void;

  addTask: (task: Omit<FeedingTask, 'id'>) => string;
  updateTask: (id: string, updates: Partial<FeedingTask>) => void;
  completeTask: (id: string, foodAmount?: number, notes?: string, notifyOwner?: boolean) => void;

  addHealthRecord: (record: Omit<HealthRecord, 'id'>) => string;

  addMessage: (message: Omit<Message, 'id' | 'isRead' | 'timestamp'>) => string;
  markMessageAsRead: (id: string) => void;

  updateInventory: (id: string, quantity: number) => void;
  deductInventory: (id: string, amount: number) => void;

  updateSchedule: (employeeId: string, date: string, updates: Partial<Schedule>) => void;

  payBill: (id: string, paymentMethod: string) => void;

  addAlert: (alert: Omit<Alert, 'id' | 'isRead' | 'createdAt' | 'status'>) => string;
  markAlertAsRead: (id: string) => void;
  markAllAlertsAsRead: () => void;
  updateAlertStatus: (id: string, status: AlertStatus, relatedMessageId?: string) => void;
  sendHealthReportToOwner: (alertId: string) => { success: boolean; messageId?: string };

  setCurrentStore: (storeId: string) => void;
}

const generatePetPhoto = (species: string, breed: string) => {
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
  feedingPlans: initialFeedingPlans,
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
    
    return { ...task, checkIn: checkIn || null, pet: pet || null };
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
        return { ...task, pet: pet || null, checkIn: checkIn || null };
      })
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  },

  getUnreadMessages: () => {
    return get().messages.filter(m => !m.isRead);
  },

  getUnreadAlerts: () => {
    return get().alerts.filter(a => !a.isRead);
  },

  getAvailableCages: (storeId) => {
    const state = get();
    const store = state.stores.find(s => s.id === storeId);
    if (!store || !store.cageNumbers) return [];
    
    const occupiedCages = state.checkIns
      .filter(c => c.storeId === storeId && c.status === 'active')
      .map(c => c.cageNumber);
    
    return store.cageNumbers.filter(cage => !occupiedCages.includes(cage));
  },

  isCageOccupied: (storeId, cageNumber) => {
    const state = get();
    return state.checkIns.some(
      c => c.storeId === storeId && c.cageNumber === cageNumber && c.status === 'active'
    );
  },

  getPetHealthRecords: (checkInId) => {
    const state = get();
    const checkIn = state.checkIns.find(c => c.id === checkInId);
    if (!checkIn) return [];
    
    const pet = state.pets.find(p => p.id === checkIn.petId);
    const plan = state.feedingPlans.find(p => p.petId === checkIn.petId);
    
    const records = state.healthRecords
      .filter(r => r.checkInId === checkInId)
      .sort((a, b) => a.recordDate.localeCompare(b.recordDate));
    
    return {
      pet,
      plan,
      records,
      checkIn,
    };
  },

  getFeedingPlanForPet: (petId) => {
    return get().feedingPlans.find(p => p.petId === petId && p.isActive);
  },

  getFeedingPlanHistory: (petId) => {
    return get().feedingPlans
      .filter(p => p.petId === petId)
      .sort((a, b) => b.version - a.version);
  },

  getCareOverview: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    const activeCheckIns = state.getActiveCheckIns();
    
    const byStore: Record<string, { store: Store; checkIns: any[] }> = {};
    
    activeCheckIns.forEach((ci: any) => {
      if (!byStore[ci.storeId]) {
        const store = state.stores.find(s => s.id === ci.storeId);
        if (store) {
          byStore[ci.storeId] = { store, checkIns: [] };
        }
      }
      if (byStore[ci.storeId]) {
        const todayTasks = state.feedingTasks.filter(
          t => t.checkInId === ci.id && t.scheduledTime.startsWith(today)
        );
        const todayRecords = state.healthRecords.filter(
          r => r.checkInId === ci.id && r.recordDate === today
        );
        const todayMessages = state.messages.filter(
          m => m.checkInId === ci.id && m.timestamp.startsWith(today)
        );
        const unreadOwnerMessages = todayMessages.filter(
          m => m.senderType === 'owner' && !m.isRead
        ).length;
        
        const feedingCompleted = todayTasks.filter(t => t.type === 'feeding' && t.status === 'completed').length;
        const feedingTotal = todayTasks.filter(t => t.type === 'feeding').length;
        const cleaningDone = todayTasks.some(t => t.type === 'cleaning' && t.status === 'completed');
        const hasHealthRecord = todayRecords.length > 0;
        const hasAbnormalToday = todayRecords.some(r => r.isAbnormal);
        
        byStore[ci.storeId].checkIns.push({
          ...ci,
          todayTasks,
          todayRecords,
          todayMessages,
          feedingCompleted,
          feedingTotal,
          cleaningDone,
          hasHealthRecord,
          hasAbnormalToday,
          unreadOwnerMessages,
        });
      }
    });
    
    return Object.values(byStore).map(group => ({
      ...group,
      checkIns: group.checkIns.sort((a, b) => 
        a.cageNumber.localeCompare(b.cageNumber)
      ),
    }));
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

  addCheckInWithDetails: ({ pet, owner, checkIn, feedingPlan }) => {
    const state = get();
    
    if (state.isCageOccupied(checkIn.storeId, checkIn.cageNumber)) {
      return { 
        success: false, 
        message: `笼位 ${checkIn.cageNumber} 已被占用，请选择其他笼位` 
      };
    }

    let ownerId = '';
    const existingOwner = state.owners.find(o => o.phone === owner.phone);
    if (existingOwner) {
      ownerId = existingOwner.id;
    } else {
      ownerId = get().addOwner(owner);
    }

    const petId = get().addPet({ ...pet, ownerId });

    const checkInId = get().addCheckIn({
      ...checkIn,
      petId,
      ownerId,
      status: 'active',
    });

    let feedingPlanId: string | undefined;
    if (feedingPlan) {
      feedingPlanId = get().addFeedingPlan({
        ...feedingPlan,
        petId,
        version: 1,
        effectiveFrom: checkIn.checkInDate,
        isActive: true,
      });
    }

    const today = checkIn.checkInDate;
    const taskTypes: { type: TaskType; time: string; needsInventory: boolean }[] = [
      { type: 'feeding', time: '07:00', needsInventory: true },
      { type: 'water', time: '08:00', needsInventory: false },
      { type: 'feeding', time: '12:00', needsInventory: true },
      { type: 'walk', time: '13:00', needsInventory: false },
      { type: 'feeding', time: '18:00', needsInventory: true },
      { type: 'water', time: '19:00', needsInventory: false },
      { type: 'cleaning', time: '20:00', needsInventory: false },
    ];

    const planData = feedingPlan && feedingPlanId
      ? { 
          inventoryId: feedingPlan.inventoryId, 
          defaultAmount: feedingPlan.defaultAmount,
          feedingPlanId,
          feedingPlanVersion: 1,
          inventoryName: feedingPlan.inventoryId 
            ? state.inventoryItems.find(i => i.id === feedingPlan.inventoryId)?.name 
            : undefined,
        }
      : (() => {
          const inventoryFood = state.inventoryItems.find(i => i.type === 'food' && i.storeId === checkIn.storeId);
          return { 
            inventoryId: inventoryFood?.id, 
            defaultAmount: 150,
            feedingPlanId: undefined,
            feedingPlanVersion: undefined,
            inventoryName: inventoryFood?.name,
          };
        })();

    taskTypes.forEach(tt => {
      get().addTask({
        checkInId,
        employeeId: state.currentUserId,
        type: tt.type,
        scheduledTime: `${today}T${tt.time}:00`,
        status: 'pending',
        inventoryId: tt.needsInventory ? planData.inventoryId : undefined,
        foodAmount: tt.needsInventory ? planData.defaultAmount : undefined,
        feedingPlanId: tt.needsInventory ? planData.feedingPlanId : undefined,
        feedingPlanVersion: tt.needsInventory ? planData.feedingPlanVersion : undefined,
        inventoryName: tt.needsInventory ? planData.inventoryName : undefined,
      });
    });

    return { success: true, checkInId };
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

  addFeedingPlan: (plan) => {
    const id = `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newPlan: FeedingPlan = { ...plan, id };
    set(state => ({ feedingPlans: [...state.feedingPlans, newPlan] }));
    return id;
  },

  updateFeedingPlan: (petId, updates) => {
    set(state => ({
      feedingPlans: state.feedingPlans.map(p => 
        p.petId === petId && p.isActive ? { ...p, ...updates } : p
      ),
    }));
  },

  createFeedingPlanVersion: (petId, updates, reason) => {
    const state = get();
    const currentPlan = state.feedingPlans.find(p => p.petId === petId && p.isActive);
    if (!currentPlan) return '';
    
    const now = new Date().toISOString();
    const newVersion = currentPlan.version + 1;
    
    const newPlan: FeedingPlan = {
      ...currentPlan,
      ...updates,
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      version: newVersion,
      effectiveFrom: now.split('T')[0],
      isActive: true,
      changeReason: reason,
    };
    
    set(state => ({
      feedingPlans: state.feedingPlans
        .map(p => p.petId === petId && p.isActive ? { ...p, isActive: false } : p)
        .concat(newPlan),
    }));
    
    get().applyFeedingPlanToPendingTasks(petId);
    return newPlan.id;
  },

  applyFeedingPlanToPendingTasks: (petId) => {
    const state = get();
    const plan = state.feedingPlans.find(p => p.petId === petId && p.isActive);
    if (!plan) return;
    
    const activeCheckIns = state.checkIns.filter(
      c => c.petId === petId && c.status === 'active'
    );
    
    const inventory = plan.inventoryId 
      ? state.inventoryItems.find(i => i.id === plan.inventoryId)
      : undefined;
    
    set(state => ({
      feedingTasks: state.feedingTasks.map(task => {
        const isMatching = activeCheckIns.some(c => c.id === task.checkInId)
          && task.type === 'feeding'
          && task.status === 'pending';
        if (!isMatching) return task;
        return {
          ...task,
          foodAmount: plan.defaultAmount,
          inventoryId: plan.inventoryId,
          inventoryName: inventory?.name,
          feedingPlanId: plan.id,
          feedingPlanVersion: plan.version,
        };
      }),
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
    
    let finalAmount = foodAmount;
    if (!finalAmount && task.type === 'feeding' && task.foodAmount) {
      finalAmount = task.foodAmount;
    }
    
    let plan: FeedingPlan | undefined;
    if (task.type === 'feeding') {
      const checkIn = state.checkIns.find(c => c.id === task.checkInId);
      if (checkIn) {
        plan = state.feedingPlans.find(p => p.petId === checkIn.petId && p.isActive);
      }
    }
    
    if (task.type === 'feeding' && !finalAmount && plan) {
      finalAmount = plan.defaultAmount;
    }

    const inventoryId = task.inventoryId || plan?.inventoryId;
    const inventory = inventoryId ? state.inventoryItems.find(i => i.id === inventoryId) : undefined;

    if (inventoryId && finalAmount && task.type === 'feeding' && inventory) {
      const deductionKg = finalAmount / 1000;
      const newQuantity = Math.max(0, inventory.quantity - deductionKg);
      
      set(state => ({
        inventoryItems: state.inventoryItems.map(i => 
          i.id === inventoryId 
            ? { ...i, quantity: newQuantity, lastUpdated: actualTime }
            : i
        ),
      }));

      if (newQuantity <= inventory.warningLevel && newQuantity > 0) {
        const existingAlert = state.alerts.find(
          a => a.type === 'inventory' && a.relatedId === inventoryId && !a.isRead
        );
        if (!existingAlert) {
          get().addAlert({
            type: 'inventory',
            title: '库存补货提醒',
            description: `「${inventory.name}」库存仅剩 ${Number(newQuantity.toFixed(2))}${inventory.unit}，已低于警戒线 ${inventory.warningLevel}${inventory.unit}，请及时补货！`,
            priority: newQuantity <= inventory.warningLevel * 0.5 ? 'high' : 'medium',
            relatedId: inventoryId,
          });
        }
      }
    }

    set(state => ({
      feedingTasks: state.feedingTasks.map(t => 
        t.id === id 
          ? { 
              ...t, 
              status: 'completed', 
              actualTime, 
              foodAmount: finalAmount, 
              notes, 
              notifyOwner,
              feedingPlanId: plan?.id || task.feedingPlanId,
              feedingPlanVersion: plan?.version || task.feedingPlanVersion,
              inventoryName: inventory?.name || task.inventoryName,
            }
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
        let content = `✅ 已完成${taskName}任务。`;
        if (finalAmount && task.type === 'feeding') {
          content += ` 食量：${finalAmount}克`;
          if (inventory) {
            content += `（${inventory.name}）`;
          }
          if (plan) {
            content += ` · 方案 v${plan.version}`;
          }
          content += '。';
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
        const symptoms: string[] = [];
        if (record.temperature > 39.5) symptoms.push(`体温${record.temperature}°C（偏高）`);
        if (record.temperature < 37.5) symptoms.push(`体温${record.temperature}°C（偏低）`);
        if (record.mentalStatus === 'poor') symptoms.push('精神状态较差');
        if (record.mentalStatus === 'critical') symptoms.push('精神状态危险');
        if (record.appetite === 'poor') symptoms.push('食欲较差');
        if (record.appetite === 'none') symptoms.push('绝食');
        if (record.medication) symptoms.push(`用药：${record.medication}`);

        get().addAlert({
          type: 'health',
          checkInId: record.checkInId,
          title: `${pet.name} 健康异常`,
          description: `${symptoms.join('，')}。${record.notes ? `备注：${record.notes}` : ''}请及时关注并处理。`,
          priority: 'high',
          relatedId: id,
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

  deductInventory: (id, amount) => {
    set(state => {
      const item = state.inventoryItems.find(i => i.id === id);
      if (!item) return state;
      
      const newQuantity = Math.max(0, item.quantity - amount);
      return {
        inventoryItems: state.inventoryItems.map(i => 
          i.id === id 
            ? { ...i, quantity: newQuantity, lastUpdated: new Date().toISOString().slice(0, 16) }
            : i
        ),
      };
    });
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
    const newAlert: Alert = { 
      ...alert, 
      id, 
      isRead: false,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set(state => ({ alerts: [...state.alerts, newAlert] }));
    return id;
  },

  markAlertAsRead: (id) => {
    set(state => ({
      alerts: state.alerts.map(a => a.id === id ? { ...a, isRead: true } : a),
    }));
  },

  markAllAlertsAsRead: () => {
    set(state => ({
      alerts: state.alerts.map(a => ({ ...a, isRead: true })),
    }));
  },

  updateAlertStatus: (id, status, relatedMessageId) => {
    const now = new Date().toISOString();
    set(state => ({
      alerts: state.alerts.map(a => 
        a.id === id ? { 
          ...a, 
          status, 
          updatedAt: now, 
          isRead: true,
          ...(relatedMessageId && { relatedMessageId })
        } : a
      ),
    }));
  },

  sendHealthReportToOwner: (alertId) => {
    const state = get();
    const alert = state.alerts.find(a => a.id === alertId);
    if (!alert || !alert.checkInId) {
      return { success: false };
    }
    
    const employee = state.employees.find(e => e.id === state.currentUserId);
    if (!employee) return { success: false };

    const healthRecordId = alert.relatedId;
    const healthRecord = healthRecordId
      ? state.healthRecords.find(r => r.id === healthRecordId)
      : undefined;
    const checkIn = state.checkIns.find(c => c.id === alert.checkInId);
    const pet = checkIn ? state.pets.find(p => p.id === checkIn.petId) : undefined;

    let content = `⚠️ 【健康异常通知】${pet ? pet.name : '宠物'} \n\n${alert.description}`;
    if (healthRecord) {
      content += `\n\n📋 当前状态：\n• 体温：${healthRecord.temperature}°C\n• 精神：${healthRecord.mentalStatus}\n• 食欲：${healthRecord.appetite}`;
      if (healthRecord.medication) {
        content += `\n• 用药：${healthRecord.medication}`;
      }
      if (healthRecord.notes) {
        content += `\n• 备注：${healthRecord.notes}`;
      }
    }
    content += `\n\n我们会持续关注宠物状态，有任何变化会及时通知您。如有疑问请随时联系我们。`;

    const messageId = get().addMessage({
      checkInId: alert.checkInId,
      senderType: 'staff',
      senderName: employee.name,
      content,
    });

    const now = new Date().toISOString();
    set(state => ({
      alerts: state.alerts.map(a => 
        a.id === alertId 
          ? { ...a, status: 'contacted', isRead: true, relatedMessageId: messageId, updatedAt: now }
          : a
      ),
    }));

    return { success: true, messageId };
  },

  setCurrentStore: (storeId) => {
    set({ currentStoreId: storeId });
  },
}));
