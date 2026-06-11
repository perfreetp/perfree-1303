import { Bell, Search, Store, User } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useState } from 'react';

export default function Header() {
  const { 
    stores, 
    currentStoreId, 
    setCurrentStore, 
    getUnreadMessages, 
    getUnreadAlerts,
    employees,
    currentUserId
  } = useAppStore();
  
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const currentStore = stores.find(s => s.id === currentStoreId);
  const currentUser = employees.find(e => e.id === currentUserId);
  const unreadMessages = getUnreadMessages().length;
  const unreadAlerts = getUnreadAlerts().length;
  const totalUnread = unreadMessages + unreadAlerts;

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowStoreMenu(!showStoreMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Store className="w-5 h-5 text-primary-500" />
              <span className="font-medium text-gray-700">{currentStore?.name || '选择门店'}</span>
            </button>
            
            {showStoreMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-fade-in">
                {stores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      setCurrentStore(store.id);
                      setShowStoreMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                      store.id === currentStoreId ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{store.name}</div>
                    <div className="text-xs text-gray-500">{store.address}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 hidden md:block">{today}</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索宠物、主人..."
              className="pl-9 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-bounce-soft">
                {totalUnread}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-9 h-9 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-700">{currentUser?.name}</div>
              <div className="text-xs text-gray-500">
                {currentUser?.role === 'manager' ? '店长' : '店员'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
