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
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TaskType } from '../../data/types';

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
  } = useAppStore();

  const stats = getDashboardStats();
  const tasks = getTasksForToday();
  const alerts = getUnreadAlerts();
  const activeCheckIns = getActiveCheckIns();

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
              <h2 className="text-lg font-semibold text-gray-800">待办任务</h2>
              <span className="text-sm text-gray-500">共 {pendingTasks.length} 项</span>
            </div>
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
                      src={task.pet.photoUrl}
                      alt={task.pet.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 truncate">{task.pet.name}</span>
                        <span className={`badge ${taskTypeColors[task.type]}`}>
                          {taskTypeLabels[task.type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTime(task.scheduledTime)}
                        <MapPin className="w-3 h-3 ml-2" />
                        {task.checkIn.cageNumber}
                      </div>
                    </div>
                    <button className="btn-outline py-1 px-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      详情
                    </button>
                  </div>
                ))
              )}
            </div>
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
                  
                  return (
                    <div
                      key={alert.id}
                      onClick={() => markAlertAsRead(alert.id)}
                      className={`p-3.5 rounded-lg border-l-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all ${priorityColors[alert.priority]} animate-slide-right`}
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
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`badge text-xs py-0.5 px-2 ${
                              alert.type === 'health' ? 'bg-pink-100 text-pink-600' :
                              alert.type === 'inventory' ? 'bg-purple-100 text-purple-600' :
                              alert.type === 'payment' ? 'bg-green-100 text-green-600' :
                              alert.type === 'vaccine' ? 'bg-cyan-100 text-cyan-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {getAlertTypeLabel(alert.type || '')}
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
                          <div className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                            {safeDescription}
                          </div>
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
