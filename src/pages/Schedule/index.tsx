import { useState, useMemo } from 'react';
import {
  CalendarDays,
  Sun,
  Moon,
  Sunrise,
  Coffee,
  Users,
  Store,
  Edit3,
  X,
  CheckCircle2,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ShiftType } from '../../data/types';

const shiftTypeConfig: Record<ShiftType, { label: string; icon: any; color: string; bgColor: string; time: string }> = {
  morning: { label: '早班', icon: Sunrise, color: 'text-orange-600', bgColor: 'bg-orange-100', time: '07:00-15:00' },
  afternoon: { label: '中班', icon: Sun, color: 'text-blue-600', bgColor: 'bg-blue-100', time: '11:00-19:00' },
  night: { label: '晚班', icon: Moon, color: 'text-purple-600', bgColor: 'bg-purple-100', time: '14:00-22:00' },
  off: { label: '休息', icon: Coffee, color: 'text-gray-500', bgColor: 'bg-gray-100', time: '' },
};

export default function SchedulePage() {
  const { schedules, employees, stores, currentStoreId, setCurrentStore, updateSchedule } = useAppStore();
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [editShift, setEditShift] = useState<ShiftType>('morning');
  const [editNotes, setEditNotes] = useState('');
  const [editHandover, setEditHandover] = useState('');

  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + selectedWeek * 7);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
        day: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    return days;
  }, [selectedWeek]);

  const storeEmployees = useMemo(() => {
    return employees.filter(e => e.storeId === currentStoreId);
  }, [employees, currentStoreId]);

  const scheduleMap = useMemo(() => {
    const map = new Map<string, typeof schedules[0]>();
    schedules.forEach(s => {
      map.set(`${s.employeeId}-${s.date}`, s);
    });
    return map;
  }, [schedules]);

  const currentStore = stores.find(s => s.id === currentStoreId);

  const getShiftStats = () => {
    const stats = { morning: 0, afternoon: 0, night: 0, off: 0 };
    weekDays.forEach(day => {
      storeEmployees.forEach(emp => {
        const s = scheduleMap.get(`${emp.id}-${day.date}`);
        if (s) {
          stats[s.shiftType]++;
        }
      });
    });
    return stats;
  };

  const shiftStats = getShiftStats();

  const handleEditStart = (employeeId: string, date: string) => {
    const s = scheduleMap.get(`${employeeId}-${date}`);
    setEditingSchedule(`${employeeId}-${date}`);
    setEditShift(s?.shiftType || 'morning');
    setEditNotes(s?.notes || '');
    setEditHandover(s?.handoverNotes || '');
  };

  const handleEditSave = (employeeId: string, date: string) => {
    updateSchedule(employeeId, date, {
      shiftType: editShift,
      notes: editNotes,
      handoverNotes: editHandover,
    });
    setEditingSchedule(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">员工排班</h1>
          <p className="text-gray-500 mt-1">管理员工班次和交接备注</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={currentStoreId}
              onChange={(e) => setCurrentStore(e.target.value)}
              className="input pl-10 pr-8 appearance-none"
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">员工总数</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{storeEmployees.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">早班</p>
              <p className="text-3xl font-bold text-orange-500 mt-1">{shiftStats.morning}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Sunrise className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">中班</p>
              <p className="text-3xl font-bold text-blue-500 mt-1">{shiftStats.afternoon}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Sun className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">晚班</p>
              <p className="text-3xl font-bold text-purple-500 mt-1">{shiftStats.night}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Moon className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedWeek(w => w - 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary-500" />
          <span className="font-semibold text-gray-800">
            {formatDate(weekDays[0].date)} - {formatDate(weekDays[6].date)}
          </span>
        </div>
        <button
          onClick={() => setSelectedWeek(w => w + 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
        {selectedWeek !== 0 && (
          <button
            onClick={() => setSelectedWeek(0)}
            className="ml-auto btn-outline text-sm py-2"
          >
            回到本周
          </button>
        )}
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        {(Object.keys(shiftTypeConfig) as ShiftType[]).map(type => {
          const cfg = shiftTypeConfig[type];
          const Icon = cfg.icon;
          return (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${cfg.bgColor}`} />
              <span className="text-sm text-gray-600">{cfg.label}</span>
              {cfg.time && <span className="text-xs text-gray-400">({cfg.time})</span>}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50 font-semibold text-gray-700">员工</div>
          {weekDays.map(day => (
            <div
              key={day.date}
              className={`p-4 text-center ${day.isToday ? 'bg-primary-50' : 'bg-gray-50'}`}
            >
              <div className="text-sm text-gray-500">{day.dayName}</div>
              <div className={`text-lg font-bold ${day.isToday ? 'text-primary-600' : 'text-gray-800'}`}>
                {day.day}
              </div>
              {day.isToday && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                  今天
                </span>
              )}
            </div>
          ))}
        </div>

        {storeEmployees.map((emp, empIndex) => (
          <div key={emp.id} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
            <div className="p-4 flex items-center gap-3 bg-gray-50">
              <img
                src={emp.avatarUrl}
                alt={emp.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-gray-800">{emp.name}</div>
                <div className="text-xs text-gray-500">
                  {emp.role === 'manager' ? '店长' : '店员'}
                </div>
              </div>
            </div>
            {weekDays.map((day, dayIndex) => {
              const s = scheduleMap.get(`${emp.id}-${day.date}`);
              const shift = s?.shiftType || 'off';
              const cfg = shiftTypeConfig[shift];
              const ShiftIcon = cfg.icon;
              const isEditing = editingSchedule === `${emp.id}-${day.date}`;
              const hasNotes = s?.notes || s?.handoverNotes;

              return (
                <div
                  key={day.date}
                  className={`p-3 ${day.isToday ? 'bg-primary-50/30' : ''} ${
                    empIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2 animate-fade-in">
                      <select
                        value={editShift}
                        onChange={(e) => setEditShift(e.target.value as ShiftType)}
                        className="input text-sm py-1 h-auto"
                      >
                        {(Object.keys(shiftTypeConfig) as ShiftType[]).map(type => (
                          <option key={type} value={type}>{shiftTypeConfig[type].label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="备注"
                        className="input text-sm py-1 h-auto"
                      />
                      <input
                        type="text"
                        value={editHandover}
                        onChange={(e) => setEditHandover(e.target.value)}
                        placeholder="交接备注"
                        className="input text-sm py-1 h-auto"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditSave(emp.id, day.date)}
                          className="flex-1 p-1.5 bg-primary-500 text-white rounded text-xs"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingSchedule(null)}
                          className="p-1.5 bg-gray-200 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleEditStart(emp.id, day.date)}
                      className="cursor-pointer group"
                    >
                      <div className={`p-2 rounded-lg ${cfg.bgColor} transition-all group-hover:shadow-md`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <ShiftIcon className={`w-4 h-4 ${cfg.color}`} />
                            <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {cfg.time && (
                          <div className="text-xs text-gray-500 mt-0.5">{cfg.time}</div>
                        )}
                      </div>
                      {hasNotes && (
                        <div className="mt-1.5 space-y-1">
                          {s?.notes && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FileText className="w-3 h-3" />
                              <span className="truncate">{s.notes}</span>
                            </div>
                          )}
                          {s?.handoverNotes && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <AlertCircle className="w-3 h-3" />
                              <span className="truncate">{s.handoverNotes}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            今日交接备注
          </h3>
          <div className="space-y-3">
            {weekDays.filter(d => d.isToday).map(day => (
              <div key={day.date}>
                {storeEmployees.map(emp => {
                  const s = scheduleMap.get(`${emp.id}-${day.date}`);
                  if (!s?.handoverNotes) return null;
                  return (
                    <div key={emp.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg mb-2">
                      <img
                        src={emp.avatarUrl}
                        alt={emp.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{emp.name}</div>
                        <div className="text-sm text-orange-700">{s.handoverNotes}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {!storeEmployees.some(emp => {
              const today = weekDays.find(d => d.isToday);
              if (!today) return false;
              const s = scheduleMap.get(`${emp.id}-${today.date}`);
              return s?.handoverNotes;
            }) && (
              <p className="text-gray-400 text-sm text-center py-4">今日暂无交接备注</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary-500" />
            今日排班
          </h3>
          <div className="space-y-3">
            {weekDays.filter(d => d.isToday).map(day => (
              <div key={day.date} className="space-y-2">
                {(Object.keys(shiftTypeConfig) as ShiftType[]).filter(t => t !== 'off').map(type => {
                  const cfg = shiftTypeConfig[type];
                  const ShiftIcon = cfg.icon;
                  const emps = storeEmployees.filter(emp => {
                    const s = scheduleMap.get(`${emp.id}-${day.date}`);
                    return s?.shiftType === type;
                  });
                  if (emps.length === 0) return null;
                  return (
                    <div key={type} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${cfg.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <ShiftIcon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</div>
                        <div className="text-sm text-gray-600">
                          {emps.map(e => e.name).join('、')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
