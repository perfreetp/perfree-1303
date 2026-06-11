import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Dog,
  UtensilsCrossed,
  HeartPulse,
  PackageOpen,
  MessageSquare,
  Calendar,
  BarChart3,
  PawPrint,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: '今日看板' },
  { path: '/checkin', icon: Dog, label: '宠物入住' },
  { path: '/feeding', icon: UtensilsCrossed, label: '喂养任务' },
  { path: '/health', icon: HeartPulse, label: '健康观察' },
  { path: '/inventory', icon: PackageOpen, label: '库存耗材' },
  { path: '/communication', icon: MessageSquare, label: '客户沟通' },
  { path: '/schedule', icon: Calendar, label: '员工排班' },
  { path: '/settlement', icon: BarChart3, label: '结算统计' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 transition-all duration-300 z-40 shadow-sm ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
        <div className={`flex items-center gap-2 overflow-hidden transition-all ${collapsed ? 'w-0' : 'w-auto'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          <div className="whitespace-nowrap">
            <h1 className="font-bold text-gray-800 text-lg">爱宠之家</h1>
            <p className="text-xs text-gray-500">Pet Care Manager</p>
          </div>
        </div>
        {collapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mx-auto">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname === '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-primary-50 text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon 
                className={`w-5 h-5 flex-shrink-0 transition-transform ${
                  collapsed ? '' : 'group-hover:scale-110'
                }`} 
              />
              {!collapsed && (
                <span className="font-medium whitespace-nowrap animate-fade-in">
                  {item.label}
                </span>
              )}
              {isActive && (
                <div className={`absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full ${collapsed ? 'hidden' : ''}`} />
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-4 right-0 translate-x-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </aside>
  );
}
