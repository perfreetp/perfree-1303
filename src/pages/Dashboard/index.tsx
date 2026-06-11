import { useState } from 'react';
import {
  PawPrint,
  CalendarCheck,
  CalendarX,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Plus,
  Clock,
  MapPin,
  Package,
  Stethoscope,
  DollarSign,
  Syringe,
  CheckSquare,
  LayoutGrid,
  Store,
  Utensils,
  Sparkles,
  MessageCircle,
  X,
  Send,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TaskType, AlertStatus } from '../../data/types';

const taskTypeLabels: Record<TaskType, string> = {
  feeding: '喂食',
  water: '喂水',
  cleaning: '清洁',
  walk: '遛放',
  bath: '洗澡',
  medication: '喂药',
};

const taskTypeColors: Record<TaskType, string> = {
  feeding: 'bg-orange-100 text-orange-700',
  water: 'bg-blue-100 text-blue-700',
  cleaning: 'bg-purple-100 text-purple-700',
  walk: 'bg-green-100 text-green-700',
  bath: 'bg-cyan-100 text-cyan-700',
  medication: 'bg-pink-100 text-pink-700',
};

const priorityColors = {
  high: 'border-l-red-500 bg-red-50',
  medium: 'border-l-yellow-500 bg-yellow-50',
  low: 'border-l-blue-500 bg-blue-50',
};

export default function Dashboard() {
  const {
    getDashboardStats,
    getTasksForToday,
    getUnreadAlerts,
    getActiveCheckIns,
    occupancyData,
    markAlertAsRead,
    completeTask,
    markAllAlertsAsRead,
    getCareOverview,
    updateAlertStatus,
    sendHealthReportToOwner,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'tasks' | 'overview'>('tasks');
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  const stats = getDashboardStats();
  const tasks = getTasksForToday();
  const alerts = getUnreadAlerts();
  const activeCheckIns = getActiveCheckIns();
  const careOverview = getCareOverview();

  const pendingTasks = tasks.filter(t => t.status === 'pending').slice(0, 8);
  const completedTasks = tasks.filter(t => t.status === 'completed').slice(0, 5);

  const statCards = [
    {
      label: '在住宠物',
      value: stats.totalPets,
      icon: PawPrint,
      color: 'from-primary-400 to-primary-600',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-500',
    },
    {
      label: '今日入住',
      value: stats.todayCheckIns,
      icon: CalendarCheck,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      label: '今日离店',
      value: stats.todayCheckOuts,
      icon: CalendarX,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: '待办任务',
      value: stats.pendingTasks,
      icon: ListTodo,
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
    },
    {
      label: '已完成',
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: 'from-secondary-400 to-secondary-600',
      bgColor: 'bg-secondary-50',
      iconColor: 'text-secondary-500',
    },
    {
      label: '异常提醒',
      value: stats.alerts,
      icon: AlertTriangle,
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500',
    },
  ];

  const handleQuickComplete = (taskId: string) => {
    completeTask(taskId, 200, '快速完成');
  };

  const formatTime = (dateStr: string) => {
    return dateStr.split('T')[1]?.substring(0, 5) || '';
  };

  const formatFullDateTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();
      
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      
      if (isToday) return `今天 ${timeStr}`;
      if (isYesterday) return `昨天 ${timeStr}`;
      return `${date.getMonth() + 1}/${date.getDate()} ${timeStr}`;
    } catch {
      return '';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'health': return Stethoscope;
      case 'inventory': return Package;
      case 'payment': return DollarSign;
      case 'vaccine': return Syringe;
      default: return AlertTriangle;
    }
  };

  const getAlertStatusLabel = (status: AlertStatus) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'contacted': return '已联系主人';
      case 'rechecked': return '已复查';
      case 'resolved': return '已解决';
      default: return '待处理';
    }
  };

  const getAlertStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-600';
      case 'contacted': return 'bg-blue-100 text-blue-600';
      case 'rechecked': return 'bg-purple-100 text-purple-600';
      case 'resolved': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleSendToOwner = (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = sendHealthReportToOwner(alertId);
    if (result.success) {
      setSelectedAlert(null);
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'health': return '健康';
      case 'inventory': return '库存';
      case 'payment': return '财务';
      case 'vaccine': return '疫苗';
      default: return '系统';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">今日看板</h1>
          <p className="text-gray-500 mt-1">欢迎回来，查看今日工作安排</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline">
            <Plus className="w-4 h-4 mr-2" />
            快速入住
          </button>
          <button className="btn-primary">
            <ListTodo className="w-4 h-4 mr-2" />
            查看全部任务
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className="card p-4 hover:shadow-lg transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              {card.label === '入住率' && (
                <span className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  5%
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-gray-800">
                {card.label === '入住率' ? `${card.value}%` : card.value}
              </div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('tasks')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'tasks'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <ListTodo className="w-4 h-4 inline-block mr-1.5" />
                  任务列表
                </button>
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'overview'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 inline-block mr-1.5" />
                  照护总控
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {viewMode === 'tasks' 
                  ? `共 ${pendingTasks.length} 项待办`
                  : `${activeCheckIns.length} 只在住宠物`
                }
              </span>
            </div>

            {viewMode === 'tasks' && (
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无待办任务</p>
                  </div>
                ) : (
                  pendingTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group animate-slide-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <button
                        onClick={() => handleQuickComplete(task.id)}
                        className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-primary-500 flex items-center justify-center transition-colors"
                      />
                      <img
                        src={task.pet?.photoUrl}
                        alt={task.pet?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800 truncate">
                            {task.pet?.name || '未知宠物'}
                          </span>
                          <span className={`badge ${taskTypeColors[task.type]}`}>
                            {taskTypeLabels[task.type]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatTime(task.scheduledTime)}
                          <MapPin className="w-3 h-3 ml-2" />
                          {task.checkIn?.cageNumber || '-'}
                        </div>
                      </div>
                      <button className="btn-outline py-1 px-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        详情
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {viewMode === 'overview' && (
              <div className="space-y-5 max-h-96 overflow-y-auto scrollbar-thin pr-1">
                {careOverview.map((group: any, gIndex: number) => (
                  <div key={group.store.id} className="animate-slide-up" style={{ animationDelay: `${gIndex * 80}ms` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-secondary-100 rounded-lg flex items-center justify-center">
                        <Store className="w-4 h-4 text-secondary-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">{group.store.name}</h3>
                      <span className="text-xs text-gray-400">
                        {group.checkIns.length}/{group.store.totalCages} 笼位
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.checkIns.map((ci: any, index: number) => (
                        <div
                          key={ci.id}
                          className={`p-3 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer ${
                            ci.hasAbnormalToday
                              ? 'border-red-200 bg-red-50/50'
                              : ci.feedingCompleted === ci.feedingTotal && ci.cleaningDone && ci.hasHealthRecord
                                ? 'border-green-200 bg-green-50/30'
                                : 'border-gray-100 bg-gray-50/50 hover:border-primary-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={ci.pet.photoUrl}
                              alt={ci.pet.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 text-sm truncate">
                                {ci.pet.name}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                笼位 {ci.cageNumber}
                              </div>
                            </div>
                            {ci.hasAbnormalToday && (
                              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-xs">
                            <div className={`text-center py-1 rounded ${
                              ci.feedingTotal > 0 && ci.feedingCompleted === ci.feedingTotal
                                ? 'bg-green-100 text-green-700'
                                : ci.feedingCompleted > 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-500'
                            }`}>
                              <Utensils className="w-3 h-3 mx-auto mb-0.5" />
                              {ci.feedingCompleted}/{ci.feedingTotal}
                            </div>
                            <div className={`text-center py-1 rounded ${
                              ci.cleaningDone
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              <Sparkles className="w-3 h-3 mx-auto mb-0.5" />
                              {ci.cleaningDone ? '已清' : '待清'}
                            </div>
                            <div className={`text-center py-1 rounded ${
                              ci.hasHealthRecord
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              <Stethoscope className="w-3 h-3 mx-auto mb-0.5" />
                              {ci.hasHealthRecord ? '已测' : '待测'}
                            </div>
                          </div>
                          {ci.unreadOwnerMessages > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-primary-600 bg-primary-50 rounded px-1.5 py-0.5 w-fit">
                              <MessageCircle className="w-3 h-3" />
                              {ci.unreadOwnerMessages} 条新消息
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {careOverview.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <PawPrint className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p>暂无在住宠物</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">入住率趋势</h2>
              <select className="input w-auto py-1 text-sm">
                <option>最近14天</option>
                <option>最近30天</option>
                <option>最近90天</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={occupancyData}>
                  <defs>
                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF7A45" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF7A45" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#FF7A45"
                    strokeWidth={2}
                    fill="url(#colorOccupancy)"
                    name="入住数"
                  />
                  <Line
                    type="monotone"
                    dataKey="capacity"
                    stroke="#E5E7EB"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="容量"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">异常提醒</h2>
                <span className={`badge ${alerts.length > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                  {alerts.length} 条未读
                </span>
              </div>
              {alerts.length > 0 && (
                <button
                  onClick={() => markAllAlertsAsRead()}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                >
                  <CheckSquare className="w-3 h-3" />
                  全部已读
                </button>
              )}
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">太棒了！暂无异常提醒</p>
                </div>
              ) : (
                alerts.map((alert, index) => {
                  const AlertIcon = getAlertIcon(alert.type || '');
                  const displayTime = formatFullDateTime(alert.createdAt);
                  const safeDescription = alert.description?.trim() || '暂无详细描述';
                  const status: AlertStatus = (alert.status as AlertStatus) || 'pending';
                  const isSelected = selectedAlert === alert.id;
                  
                  return (
                    <div
                      key={alert.id}
                      onClick={() => {
                        markAlertAsRead(alert.id);
                        setSelectedAlert(isSelected ? null : alert.id);
                      }}
                      className={`p-3.5 rounded-lg border-l-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'shadow-md -translate-y-0.5 scale-[1.01]' 
                          : 'hover:shadow-md hover:-translate-y-0.5'
                      } ${priorityColors[alert.priority]} animate-slide-right`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          alert.priority === 'high' ? 'bg-red-100' :
                          alert.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <AlertIcon className={`w-4.5 h-4.5 ${
                            alert.priority === 'high' ? 'text-red-500' :
                            alert.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`badge text-xs py-0.5 px-2 ${
                              alert.type === 'health' ? 'bg-pink-100 text-pink-600' :
                              alert.type === 'inventory' ? 'bg-purple-100 text-purple-600' :
                              alert.type === 'payment' ? 'bg-green-100 text-green-600' :
                              alert.type === 'vaccine' ? 'bg-cyan-100 text-cyan-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {getAlertTypeLabel(alert.type || '')}
                            </span>
                            <span className={`badge text-xs py-0.5 px-2 ${getAlertStatusColor(status)}`}>
                              {getAlertStatusLabel(status)}
                            </span>
                            {alert.priority === 'high' && (
                              <span className="badge bg-red-100 text-red-600 text-xs py-0.5 px-2">
                                紧急
                              </span>
                            )}
                            <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                              {displayTime}
                            </span>
                          </div>
                          <div className="font-semibold text-gray-800 text-sm mb-1 leading-snug">
                            {alert.title || '未命名提醒'}
                          </div>
                          <div className={`text-xs text-gray-600 leading-relaxed ${
                            isSelected ? '' : 'line-clamp-2'
                          }`}>
                            {safeDescription}
                          </div>
                          
                          {isSelected && alert.type === 'health' && (
                            <div className="mt-3 pt-3 border-t border-gray-200/50 flex items-center gap-2 flex-wrap">
                              {status === 'pending' && (
                                <button
                                  onClick={(e) => handleSendToOwner(alert.id, e)}
                                  className="btn-primary text-xs py-1.5 px-3"
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  通知主人
                                </button>
                              )}
                              {status === 'contacted' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateAlertStatus(alert.id, 'rechecked');
                                  }}
                                  className="btn-secondary text-xs py-1.5 px-3"
                                >
                                  <Stethoscope className="w-3 h-3 mr-1" />
                                  标记已复查
                                </button>
                              )}
                              {status === 'rechecked' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateAlertStatus(alert.id, 'resolved');
                                  }}
                                  className="btn-outline text-xs py-1.5 px-3"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  标记解决
                                </button>
                              )}
                              {status !== 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateAlertStatus(alert.id, 'pending');
                                  }}
                                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                                >
                                  重置为待处理
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">在住宠物</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
              {activeCheckIns.slice(0, 6).map((checkIn, index) => (
                <div
                  key={checkIn.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <img
                    src={checkIn.pet.photoUrl}
                    alt={checkIn.pet.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm truncate">
                      {checkIn.pet.name}
                      <span className="text-gray-400 ml-1">
                        {checkIn.pet.species === 'dog' ? '🐕' : '🐈'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {checkIn.cageNumber} · {checkIn.owner.name}
                    </div>
                  </div>
                  <span className="badge-primary text-xs">
                    {checkIn.expectedCheckOutDate.split('-').slice(1).join('/')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center gap-2 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group">
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">入住登记</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors group">
                <div className="w-12 h-12 bg-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ListTodo className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">任务记录</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">健康记录</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors group">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">离店结算</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
