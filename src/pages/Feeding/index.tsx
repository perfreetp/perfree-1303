import { useState } from 'react';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Circle,
  Camera,
  Send,
  Plus,
  Filter,
  MapPin,
  Droplets,
  Trash2,
  Footprints,
  Bath,
  Pill,
  X,
  Cookie,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { TaskType } from '../../data/types';

const taskTypeConfig: Record<TaskType, { label: string; icon: any; color: string }> = {
  feeding: { label: '喂食', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-600' },
  water: { label: '喂水', icon: Droplets, color: 'bg-blue-100 text-blue-600' },
  cleaning: { label: '清洁', icon: Trash2, color: 'bg-purple-100 text-purple-600' },
  walk: { label: '遛放', icon: Footprints, color: 'bg-green-100 text-green-600' },
  bath: { label: '洗澡', icon: Bath, color: 'bg-cyan-100 text-cyan-600' },
  medication: { label: '喂药', icon: Pill, color: 'bg-pink-100 text-pink-600' },
};

const timeSlots = [
  { time: '07:00', label: '早晨' },
  { time: '08:00', label: '早晨' },
  { time: '12:00', label: '中午' },
  { time: '13:00', label: '中午' },
  { time: '18:00', label: '傍晚' },
  { time: '19:00', label: '傍晚' },
  { time: '20:00', label: '晚间' },
];

export default function Feeding() {
  const { getTasksForToday, completeTask, employees, getActiveCheckIns, addTask, currentUserId, inventoryItems, currentStoreId } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<TaskType | 'all'>('all');
  const [foodAmount, setFoodAmount] = useState<number>(200);
  const [notes, setNotes] = useState('');
  const [notifyOwner, setNotifyOwner] = useState(true);
  const [showSnackModal, setShowSnackModal] = useState(false);
  const [snackCheckInId, setSnackCheckInId] = useState('');
  const [snackAmount, setSnackAmount] = useState(50);
  const [snackNotes, setSnackNotes] = useState('');

  const tasks = getTasksForToday();
  const activeCheckIns = getActiveCheckIns();
  
  const filteredTasks = filterType === 'all' 
    ? tasks 
    : tasks.filter(t => t.type === filterType);

  const groupedTasks = timeSlots.map(slot => ({
    ...slot,
    tasks: filteredTasks.filter(t => t.scheduledTime.includes(slot.time)),
  }));

  const hasOtherTasks = filteredTasks.length > groupedTasks.reduce((sum, slot) => sum + slot.tasks.length, 0);

  const handleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const amount = task.type === 'feeding' ? foodAmount : undefined;
    completeTask(taskId, amount, notes, notifyOwner);
    setSelectedTask(null);
    setNotes('');
    setFoodAmount(200);
  };

  const handleAddSnack = () => {
    if (!snackCheckInId) return;

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    
    const inventoryFood = inventoryItems.find(i => i.type === 'food' && i.storeId === currentStoreId);

    addTask({
      checkInId: snackCheckInId,
      employeeId: currentUserId,
      type: 'feeding',
      scheduledTime: `${now.toISOString().split('T')[0]}T${timeStr}:00`,
      status: 'pending',
      inventoryId: inventoryFood?.id,
      notes: snackNotes || '临时加餐',
      foodAmount: snackAmount,
    });

    setShowSnackModal(false);
    setSnackCheckInId('');
    setSnackAmount(50);
    setSnackNotes('');
  };

  const formatTime = (dateStr: string) => {
    return dateStr.split('T')[1]?.substring(0, 5) || '';
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">喂养任务</h1>
          <p className="text-gray-500 mt-1">管理今日喂养和照护任务</p>
        </div>
        <button className="btn-primary" onClick={() => setShowSnackModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          临时加餐
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">今日任务</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{tasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已完成</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">完成进度</p>
              <p className="text-3xl font-bold text-secondary-600 mt-1">{progress}%</p>
            </div>
            <div className="w-16">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          全部
        </button>
        {(Object.keys(taskTypeConfig) as TaskType[]).map(type => {
          const Icon = taskTypeConfig[type].icon;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filterType === type
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {taskTypeConfig[type].label}
            </button>
          );
        })}
        <button className="btn-outline ml-auto">
          <Filter className="w-4 h-4 mr-2" />
          更多筛选
        </button>
      </div>

      <div className="space-y-6">
        {groupedTasks.map((slot, slotIndex) => (
          slot.tasks.length > 0 && (
            <div key={slot.time} className="animate-slide-up" style={{ animationDelay: `${slotIndex * 50}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">
                  {slot.time}
                </div>
                <span className="text-sm text-gray-500">{slot.label}</span>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">{slot.tasks.length} 项任务</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slot.tasks.map((task, taskIndex) => {
                  const config = taskTypeConfig[task.type];
                  const Icon = config.icon;
                  const isSelected = selectedTask === task.id;
                  const employee = employees.find(e => e.id === task.employeeId);

                  if (!task.pet || !task.checkIn) return null;

                  return (
                    <div
                      key={task.id}
                      className={`card p-4 transition-all cursor-pointer ${
                        task.status === 'completed' 
                          ? 'opacity-60' 
                          : isSelected 
                            ? 'ring-2 ring-primary-500 shadow-lg' 
                            : 'hover:shadow-md'
                      }`}
                      onClick={() => task.status === 'pending' && setSelectedTask(isSelected ? null : task.id)}
                      style={{ animationDelay: `${taskIndex * 30}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (task.status === 'pending') {
                              handleComplete(task.id);
                            }
                          }}
                          className={`mt-1 ${task.status === 'completed' ? 'cursor-default' : ''}`}
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300 hover:text-primary-500 transition-colors" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <img
                              src={task.pet.photoUrl}
                              alt={task.pet.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-800">{task.pet.name}</h4>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {task.checkIn.cageNumber}
                              </div>
                            </div>
                            <span className={`badge ${config.color} ml-auto`}>
                              <Icon className="w-3 h-3 mr-1" />
                              {config.label}
                            </span>
                          </div>

                          {task.status === 'completed' && task.notes && (
                            <p className="text-sm text-gray-500 mt-2">
                              {task.notes}
                              {task.foodAmount && ` · 食量 ${task.foodAmount}g`}
                            </p>
                          )}

                          {task.status === 'completed' && task.actualTime && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                              <Clock className="w-3 h-3" />
                              完成于 {formatTime(task.actualTime)}
                            </div>
                          )}

                          {task.status === 'completed' && task.notifyOwner && (
                            <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                              <Send className="w-3 h-3" />
                              已通知主人
                            </div>
                          )}

                          {employee && (
                            <div className="text-xs text-gray-400 mt-2">
                              负责人：{employee.name}
                            </div>
                          )}

                          {isSelected && task.status === 'pending' && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-slide-up">
                              {task.type === 'feeding' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    食量（克）
                                  </label>
                                  <input
                                    type="number"
                                    value={foodAmount}
                                    onChange={(e) => setFoodAmount(Number(e.target.value))}
                                    className="input"
                                    min="0"
                                  />
                                </div>
                              )}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  备注
                                </label>
                                <textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  className="input min-h-[60px] resize-none"
                                  placeholder="记录宠物状态..."
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="notify"
                                  checked={notifyOwner}
                                  onChange={(e) => setNotifyOwner(e.target.checked)}
                                  className="w-4 h-4 text-primary-500 rounded"
                                />
                                <label htmlFor="notify" className="text-sm text-gray-600">
                                  同时通知主人
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <button className="btn-outline flex-1 text-sm">
                                  <Camera className="w-4 h-4 mr-1" />
                                  上传照片
                                </button>
                                <button 
                                  className="btn-secondary flex-1 text-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleComplete(task.id);
                                  }}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  确认完成
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ))}

        {hasOtherTasks && (
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-sm font-bold">
                其他
              </div>
              <span className="text-sm text-gray-500">临时任务</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks
                .filter(t => !timeSlots.some(s => t.scheduledTime.includes(s.time)))
                .map((task, taskIndex) => {
                  const config = taskTypeConfig[task.type];
                  const Icon = config.icon;
                  const isSelected = selectedTask === task.id;
                  const employee = employees.find(e => e.id === task.employeeId);

                  if (!task.pet || !task.checkIn) return null;

                  return (
                    <div
                      key={task.id}
                      className={`card p-4 transition-all cursor-pointer ${
                        task.status === 'completed' 
                          ? 'opacity-60' 
                          : isSelected 
                            ? 'ring-2 ring-primary-500 shadow-lg' 
                            : 'hover:shadow-md'
                      }`}
                      onClick={() => task.status === 'pending' && setSelectedTask(isSelected ? null : task.id)}
                      style={{ animationDelay: `${taskIndex * 30}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (task.status === 'pending') {
                              handleComplete(task.id);
                            }
                          }}
                          className={`mt-1 ${task.status === 'completed' ? 'cursor-default' : ''}`}
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300 hover:text-primary-500 transition-colors" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <img
                              src={task.pet.photoUrl}
                              alt={task.pet.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-800">{task.pet.name}</h4>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {task.checkIn.cageNumber}
                              </div>
                            </div>
                            <span className={`badge ${config.color} ml-auto`}>
                              <Icon className="w-3 h-3 mr-1" />
                              {config.label}
                            </span>
                          </div>

                          {task.notes && (
                            <div className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-1 mt-1">
                              {task.notes}
                            </div>
                          )}

                          {isSelected && task.status === 'pending' && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-slide-up">
                              {task.type === 'feeding' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    食量（克）
                                  </label>
                                  <input
                                    type="number"
                                    value={foodAmount}
                                    onChange={(e) => setFoodAmount(Number(e.target.value))}
                                    className="input"
                                    min="0"
                                  />
                                </div>
                              )}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  备注
                                </label>
                                <textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  className="input min-h-[60px] resize-none"
                                  placeholder="记录宠物状态..."
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`notify-${task.id}`}
                                  checked={notifyOwner}
                                  onChange={(e) => setNotifyOwner(e.target.checked)}
                                  className="w-4 h-4 text-primary-500 rounded"
                                />
                                <label htmlFor={`notify-${task.id}`} className="text-sm text-gray-600">
                                  同时通知主人
                                </label>
                              </div>
                              <button 
                                className="btn-secondary w-full text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleComplete(task.id);
                                }}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                确认完成
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <p className="text-gray-500">该时间段暂无任务</p>
        </div>
      )}

      {showSnackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Cookie className="w-5 h-5 text-orange-500" />
                临时加餐
              </h3>
              <button
                onClick={() => setShowSnackModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择宠物 <span className="text-red-500">*</span>
                </label>
                <select
                  value={snackCheckInId}
                  onChange={(e) => setSnackCheckInId(e.target.value)}
                  className="input"
                >
                  <option value="">请选择宠物</option>
                  {activeCheckIns.map(ci => (
                    <option key={ci.id} value={ci.id}>
                      {ci.pet.name} - {ci.pet.breed}（笼位 {ci.cageNumber}）
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  食量（克）
                </label>
                <input
                  type="number"
                  value={snackAmount}
                  onChange={(e) => setSnackAmount(Number(e.target.value))}
                  className="input"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  value={snackNotes}
                  onChange={(e) => setSnackNotes(e.target.value)}
                  className="input min-h-[80px] resize-none"
                  placeholder="加餐原因、特殊说明等..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowSnackModal(false)}
                className="btn-outline flex-1"
              >
                取消
              </button>
              <button
                onClick={handleAddSnack}
                disabled={!snackCheckInId}
                className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
