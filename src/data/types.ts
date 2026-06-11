export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  totalCages: number;
  occupiedCages: number;
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  wechat?: string;
}

export interface VaccineRecord {
  id: string;
  name: string;
  date: string;
  nextDate: string;
  isExpired: boolean;
}

export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  weight?: number;
  photoUrl: string;
  ownerId: string;
  vaccineRecords: VaccineRecord[];
}

export interface CheckIn {
  id: string;
  petId: string;
  ownerId: string;
  storeId: string;
  checkInDate: string;
  expectedCheckOutDate: string;
  actualCheckOutDate?: string;
  cageNumber: string;
  status: 'active' | 'completed' | 'cancelled';
  specialRequirements: string;
  dailyRate: number;
  deposit: number;
}

export type TaskType = 'feeding' | 'water' | 'cleaning' | 'walk' | 'bath' | 'medication';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface FeedingTask {
  id: string;
  checkInId: string;
  employeeId: string;
  type: TaskType;
  scheduledTime: string;
  actualTime?: string;
  foodAmount?: number;
  status: TaskStatus;
  notes?: string;
  inventoryId?: string;
  photoUrl?: string;
  notifyOwner?: boolean;
}

export type MentalStatus = 'excellent' | 'good' | 'normal' | 'poor' | 'critical';
export type Appetite = 'excellent' | 'good' | 'normal' | 'poor' | 'none';
export type BowelMovement = 'normal' | 'soft' | 'diarrhea' | 'constipated' | 'none';

export interface HealthRecord {
  id: string;
  checkInId: string;
  recordDate: string;
  temperature: number;
  mentalStatus: MentalStatus;
  appetite: Appetite;
  bowelMovement: BowelMovement;
  medication?: string;
  notes?: string;
  isAbnormal: boolean;
}

export type InventoryType = 'food' | 'snack' | 'supply' | 'medicine';

export interface InventoryItem {
  id: string;
  name: string;
  type: InventoryType;
  quantity: number;
  unit: string;
  warningLevel: number;
  storeId: string;
  lastUpdated: string;
}

export type SenderType = 'staff' | 'owner' | 'system';

export interface Message {
  id: string;
  checkInId: string;
  senderType: SenderType;
  senderName: string;
  content: string;
  photoUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export type EmployeeRole = 'staff' | 'manager';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  storeId: string;
  avatarUrl?: string;
}

export type ShiftType = 'morning' | 'afternoon' | 'night' | 'off';

export interface Schedule {
  id: string;
  employeeId: string;
  date: string;
  shiftType: ShiftType;
  notes?: string;
  handoverNotes?: string;
}

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Bill {
  id: string;
  checkInId: string;
  baseAmount: number;
  addonAmount: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  paymentMethod?: string;
  items: BillItem[];
}

export interface ServiceAddon {
  id: string;
  checkInId: string;
  serviceType: string;
  description: string;
  price: number;
  serviceDate: string;
}

export interface Alert {
  id: string;
  type: 'vaccine' | 'health' | 'inventory' | 'payment';
  checkInId?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface FeedingPlan {
  id: string;
  petId: string;
  foodType: 'dry' | 'wet' | 'raw' | 'prescription';
  foodBrand: string;
  inventoryId?: string;
  defaultAmount: number;
  dailyMeals: number;
  specialNotes?: string;
}

export interface CheckInWithDetails extends CheckIn {
  pet: Pet;
  owner: Owner;
  store: Store;
}

export interface TaskWithDetails extends FeedingTask {
  pet: Pet;
  checkIn: CheckIn;
}

export interface HealthRecordWithDetails extends HealthRecord {
  pet: Pet;
}

export interface DashboardStats {
  totalPets: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  pendingTasks: number;
  completedTasks: number;
  alerts: number;
  occupancyRate: number;
}

export interface OccupancyData {
  date: string;
  occupancy: number;
  capacity: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}
