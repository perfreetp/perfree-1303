import { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Search,
  Plus,
  Minus,
  Filter,
  Store,
  Clock,
  UtensilsCrossed,
  Cookie,
  Wrench,
  Pill,
  Edit3,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { InventoryType } from '../../data/types';

const inventoryTypeConfig: Record<InventoryType, { label: string; icon: any; color: string }> = {
  food: { label: '粮食', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-600' },
  snack: { label: '零食', icon: Cookie, color: 'bg-yellow-100 text-yellow-600' },
  supply: { label: '耗材', icon: Wrench, color: 'bg-blue-100 text-blue-600' },
  medicine: { label: '药品', icon: Pill, color: 'bg-pink-100 text-pink-600' },
};

export default function Inventory() {
  const { inventoryItems, stores, currentStoreId, updateInventory, setCurrentStore } = useAppStore();
  const [selectedType, setSelectedType] = useState<InventoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editItem, setEditItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const storeItems = useMemo(() => {
    return inventoryItems.filter(item => item.storeId === currentStoreId);
  }, [inventoryItems, currentStoreId]);

  const filteredItems = useMemo(() => {
    return storeItems.filter(item => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesSearch = item.name.includes(searchQuery);
      const matchesLowStock = !showLowStockOnly || item.quantity <= item.warningLevel;
      return matchesType && matchesSearch && matchesLowStock;
    }).sort((a, b) => {
      const aLow = a.quantity <= a.warningLevel ? 1 : 0;
      const bLow = b.quantity <= b.warningLevel ? 1 : 0;
      return bLow - aLow;
    });
  }, [storeItems, selectedType, searchQuery, showLowStockOnly]);

  const lowStockCount = storeItems.filter(item => item.quantity <= item.warningLevel).length;
  const totalValue = storeItems.reduce((sum, item) => sum + item.quantity, 0);
  const currentStore = stores.find(s => s.id === currentStoreId);

  const handleEditStart = (item: typeof storeItems[0]) => {
    setEditItem(item.id);
    setEditQuantity(item.quantity);
  };

  const handleEditSave = (id: string) => {
    updateInventory(id, editQuantity);
    setEditItem(null);
  };

  const handleQuantityAdjust = (id: string, delta: number) => {
    const item = storeItems.find(i => i.id === id);
    if (item) {
      const newQuantity = Math.max(0, item.quantity + delta);
      updateInventory(id, newQuantity);
    }
  };

  const getStockLevel = (quantity: number, warningLevel: number) => {
    if (quantity <= warningLevel * 0.5) return { color: 'bg-red-500', text: '严重不足' };
    if (quantity <= warningLevel) return { color: 'bg-orange-500', text: '库存紧张' };
    if (quantity <= warningLevel * 2) return { color: 'bg-yellow-500', text: '库存偏低' };
    return { color: 'bg-green-500', text: '库存充足' };
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">库存耗材</h1>
          <p className="text-gray-500 mt-1">管理粮食、零食、耗材和药品库存</p>
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
              <p className="text-sm text-gray-500">商品种类</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{storeItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">低库存预警</p>
              <p className={`text-3xl font-bold mt-1 ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {lowStockCount}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle className={`w-6 h-6 ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">库存总量</p>
              <p className="text-3xl font-bold text-secondary-600 mt-1">{Math.round(totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-secondary-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">当前门店</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{currentStore?.name}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800">库存预警</h4>
              <p className="text-sm text-red-600 mt-1">
                有 {lowStockCount} 种商品库存低于警戒线，请及时补货。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索商品名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            全部
          </button>
          {(Object.keys(inventoryTypeConfig) as InventoryType[]).map(type => {
            const cfg = inventoryTypeConfig[type];
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedType === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cfg.label}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
            className="w-4 h-4 text-primary-500 rounded"
          />
          <span className="text-sm text-gray-600">仅显示低库存</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => {
          const typeConfig = inventoryTypeConfig[item.type];
          const TypeIcon = typeConfig.icon;
          const stockLevel = getStockLevel(item.quantity, item.warningLevel);
          const isLow = item.quantity <= item.warningLevel;
          const isEditing = editItem === item.id;

          return (
            <div
              key={item.id}
              className={`card p-5 animate-slide-up ${isLow ? 'border-red-200' : ''}`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeConfig.color.split(' ')[0]}`}>
                    <TypeIcon className={`w-6 h-6 ${typeConfig.color.split(' ')[1]}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <span className={`badge ${typeConfig.color} text-xs`}>
                      {typeConfig.label}
                    </span>
                  </div>
                </div>
                {isLow && (
                  <span className="badge bg-red-100 text-red-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    预警
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-sm text-gray-500">当前库存</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(Math.max(0, Number(e.target.value)))}
                          className="input w-24 h-8 text-lg font-bold py-0"
                          min="0"
                          autoFocus
                        />
                        <span className="text-sm text-gray-500">{item.unit}</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold ${isLow ? 'text-red-500' : 'text-gray-800'}`}>
                          {item.quantity}
                        </span>
                        <span className="text-sm text-gray-500">{item.unit}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">警戒线</span>
                    <p className="text-lg font-semibold text-gray-600">{item.warningLevel} {item.unit}</p>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stockLevel.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, (item.quantity / (item.warningLevel * 3)) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${isLow ? 'text-red-500' : 'text-gray-500'}`}>
                    {stockLevel.text}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(item.lastUpdated)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleEditSave(item.id)}
                      className="btn-secondary flex-1 text-sm py-2"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      保存
                    </button>
                    <button
                      onClick={() => setEditItem(null)}
                      className="btn-outline text-sm py-2 px-3"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleQuantityAdjust(item.id, -1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleQuantityAdjust(item.id, 1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleEditStart(item)}
                      className="btn-outline flex-1 text-sm py-2"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      调整
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <p className="text-gray-500">{showLowStockOnly ? '暂无低库存商品' : '暂无库存商品'}</p>
        </div>
      )}
    </div>
  );
}
