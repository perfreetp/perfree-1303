import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  Phone,
  User,
  CheckCircle2,
  X,
  ChevronRight,
  AlertCircle,
  PawPrint,
  AlertTriangle,
  TrendingUp,
  CheckSquare,
  Home,
  AlertOctagon,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { CheckIn as CheckInType } from '../../data/types';

export default function CheckIn() {
  const {
    getActiveCheckIns,
    checkIns,
    pets,
    owners,
    stores,
    addCheckInWithDetails,
    completeCheckIn,
    getAvailableCages,
    isCageOccupied,
    inventoryItems,
    currentStoreId,
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newStep, setNewStep] = useState(1);
  const [checkOutConfirm, setCheckOutConfirm] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [newPet, setNewPet] = useState({
    name: '',
    species: 'dog' as 'dog' | 'cat' | 'other',
    breed: '',
    age: 1,
    gender: 'male' as 'male' | 'female',
    photoUrl: '',
  });

  const [newOwner, setNewOwner] = useState({
    name: '',
    phone: '',
    wechat: '',
  });

  const [newCheckIn, setNewCheckIn] = useState({
    storeId: currentStoreId,
    checkInDate: new Date().toISOString().split('T')[0],
    expectedCheckOutDate: '',
    cageNumber: '',
    specialRequirements: '',
    dailyRate: 108,
    deposit: 400,
  });

  const [newFeedingPlan, setNewFeedingPlan] = useState({
    foodType: 'dry' as 'dry' | 'wet' | 'raw' | 'prescription',
    foodBrand: '',
    inventoryId: '' as string | undefined,
    defaultAmount: 150,
    dailyMeals: 3,
    specialNotes: '',
  });

  const activeCheckIns = getActiveCheckIns();

  const filteredActive = useMemo(() => {
    return activeCheckIns.filter(ci => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        ci.pet.name.toLowerCase().includes(query) ||
        ci.owner.name.toLowerCase().includes(query)
      );
    });
  }, [activeCheckIns, searchQuery]);

  const historyCheckIns = (() => {
    const items = checkIns
      .filter(c => c.status !== 'active')
      .map(c => {
        const pet = pets.find(p => p.id === c.petId);
        const owner = owners.find(o => o.id === c.ownerId);
        const store = stores.find(s => s.id === c.storeId);
        if (!pet || !owner || !store) return null;
        return { ...c, pet, owner, store };
      })
      .filter(Boolean) as any[];
    
    return items.filter((ci: any) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        ci.pet.name.toLowerCase().includes(query) ||
        ci.owner.name.toLowerCase().includes(query) ||
        ci.cageNumber?.toLowerCase().includes(query)
      );
    });
  })();

  const availableCages = getAvailableCages(newCheckIn.storeId);
  const foodInventoryItems = inventoryItems.filter(i => i.type === 'food' && i.storeId === newCheckIn.storeId);

  const handleSubmit = () => {
    setSaveError(null);
    
    if (isCageOccupied(newCheckIn.storeId, newCheckIn.cageNumber)) {
      setSaveError(`笼位 ${newCheckIn.cageNumber} 已被占用，请选择其他笼位`);
      return;
    }

    if (!newPet.name || !newOwner.name || !newOwner.phone || !newCheckIn.expectedCheckOutDate || !newCheckIn.cageNumber) {
      setSaveError('请填写所有必填字段');
      return;
    }

    const result = addCheckInWithDetails({
      pet: {
        name: newPet.name,
        species: newPet.species,
        breed: newPet.breed || (newPet.species === 'dog' ? '中华田园犬' : '田园猫'),
        age: newPet.age || 1,
        gender: newPet.gender,
        photoUrl: newPet.photoUrl || undefined,
        vaccineRecords: [],
      },
      owner: {
        name: newOwner.name,
        phone: newOwner.phone,
        wechat: newOwner.wechat || undefined,
      },
      checkIn: {
        storeId: newCheckIn.storeId,
        checkInDate: newCheckIn.checkInDate,
        expectedCheckOutDate: newCheckIn.expectedCheckOutDate,
        cageNumber: newCheckIn.cageNumber,
        specialRequirements: newCheckIn.specialRequirements,
        dailyRate: newCheckIn.dailyRate,
        deposit: newCheckIn.deposit,
      },
      feedingPlan: {
        foodType: newFeedingPlan.foodType,
        foodBrand: newFeedingPlan.foodBrand || '通用粮食',
        inventoryId: newFeedingPlan.inventoryId,
        defaultAmount: newFeedingPlan.defaultAmount,
        dailyMeals: newFeedingPlan.dailyMeals,
        specialNotes: newFeedingPlan.specialNotes || undefined,
      },
    });

    if (result.success) {
      setActiveTab('active');
      setShowNewModal(false);
      setNewStep(1);
      setNewPet({ name: '', species: 'dog', breed: '', age: 1, gender: 'male', photoUrl: '' });
      setNewOwner({ name: '', phone: '', wechat: '' });
      setNewCheckIn({
        storeId: currentStoreId,
        checkInDate: new Date().toISOString().split('T')[0],
        expectedCheckOutDate: '',
        cageNumber: '',
        specialRequirements: '',
        dailyRate: 108,
        deposit: 400,
      });
      setNewFeedingPlan({
        foodType: 'dry',
        foodBrand: '',
        inventoryId: undefined,
        defaultAmount: 150,
        dailyMeals: 3,
        specialNotes: '',
      });
    } else {
      setSaveError(result.message || '保存失败，请重试');
    }
  };

  const handleCheckOut = (id: string) => {
    completeCheckIn(id);
    setCheckOutConfirm(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const today = new Date().toISOString().split('T')[0];
  const checkInsToday = checkIns.filter(c => c.checkInDate === today).length;
  const checkOutsToday = checkIns.filter(c => c.expectedCheckOutDate === today && c.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">宠物入住</h1>
          <p className="text-gray-500 mt-1">办理入住登记和离店确认</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增入住
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">在住宠物</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{activeCheckIns.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">今日入住</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{checkInsToday}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">今日离店</p>
              <p className="text-3xl font-bold text-orange-500 mt-1">{checkOutsToday}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">空笼位数</p>
              <p className="text-3xl font-bold text-secondary-600 mt-1">
                {stores.reduce((sum, s) => sum + s.totalCages, 0) - activeCheckIns.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-secondary-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            在住 ({activeCheckIns.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            历史记录 ({historyCheckIns.length})
          </button>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索宠物或主人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActive.map((checkIn, index) => {
            const days = calculateDays(checkIn.checkInDate, checkIn.expectedCheckOutDate);
            const todayDate = new Date();
            const checkOutDate = new Date(checkIn.expectedCheckOutDate);
            const daysLeft = Math.ceil((checkOutDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
            const isCheckOutToday = daysLeft <= 0;

            return (
              <div
                key={checkIn.id}
                className="card p-5 animate-slide-up hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={checkIn.pet.photoUrl}
                    alt={checkIn.pet.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800 text-lg">{checkIn.pet.name}</h4>
                      <span className="badge bg-primary-100 text-primary-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {checkIn.cageNumber}
                      </span>
                      {isCheckOutToday && (
                        <span className="badge bg-orange-100 text-orange-600">今日离店</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      {checkIn.pet.breed} · {checkIn.pet.age}岁 · {checkIn.pet.gender === 'male' ? '♂' : '♀'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span className="truncate">{checkIn.owner.name}</span>
                      <span>·</span>
                      <Phone className="w-3.5 h-3.5" />
                      <span>{checkIn.owner.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      入住日期
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {formatDate(checkIn.checkInDate)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      预计离店
                    </div>
                    <div className={`text-sm font-semibold ${isCheckOutToday ? 'text-orange-600' : 'text-gray-800'}`}>
                      {formatDate(checkIn.expectedCheckOutDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-gray-500">共 {days} 天 · 剩余 {Math.max(0, daysLeft)} 天</span>
                  <span className="text-primary-600 font-semibold">¥{checkIn.dailyRate}/天</span>
                </div>

                {checkIn.specialRequirements && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 mb-4">
                    <p className="text-sm text-yellow-700">
                      <span className="font-medium">特殊要求：</span>
                      {checkIn.specialRequirements}
                    </p>
                  </div>
                )}

                {checkIn.pet.vaccineRecords?.some(v => v.isExpired) && (
                  <div className="flex items-center gap-1 text-xs text-red-600 mb-4 bg-red-50 rounded px-2 py-1.5">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    有疫苗已过期
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckOutConfirm(checkIn.id)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    确认离店
                  </button>
                </div>
              </div>
            );
          })}

          {filteredActive.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PawPrint className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-gray-500">
                {searchQuery ? '未找到匹配的入住记录' : '暂无在住宠物'}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {historyCheckIns.map((checkIn: any, index: number) => (
            <div
              key={checkIn.id}
              className="card p-5 animate-slide-up opacity-80"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={checkIn.pet.photoUrl}
                  alt={checkIn.pet.name}
                  className="w-16 h-16 rounded-xl object-cover grayscale"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{checkIn.pet.name}</h4>
                    <span className="badge bg-gray-100 text-gray-600">已离店</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    {checkIn.pet.breed} · {checkIn.pet.age}岁
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span>{checkIn.owner.name}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500 mb-1">入住</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {formatDate(checkIn.checkInDate)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500 mb-1">离店</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {checkIn.actualCheckOutDate || formatDate(checkIn.expectedCheckOutDate)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  共 {calculateDays(checkIn.checkInDate, checkIn.actualCheckOutDate || checkIn.expectedCheckOutDate)} 天
                </span>
                <span className="text-primary-600 font-semibold">
                  {checkIn.store?.name}
                </span>
              </div>
            </div>
          ))}

          {historyCheckIns.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {searchQuery ? '未找到匹配的历史记录' : '暂无历史记录'}
              </p>
            </div>
          )}
        </div>
      )}

      {checkOutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertOctagon className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">确认离店</h3>
              <p className="text-gray-500 text-center mb-6">
                确认该宠物已离店？此操作将同时生成离店账单。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCheckOutConfirm(null)}
                  className="btn-outline flex-1"
                >
                  取消
                </button>
                <button
                  onClick={() => handleCheckOut(checkOutConfirm)}
                  className="btn-secondary flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-gray-800">新增入住登记</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map(step => (
                    <div
                      key={step}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        newStep === step
                          ? 'bg-primary-500 text-white'
                          : newStep > step
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {newStep > step ? <CheckCircle2 className="w-3 h-3" /> : step}
                      <span>
                        {step === 1 ? '宠物信息' : step === 2 ? '主人信息' : step === 3 ? '入住信息' : '喂养方案'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {saveError && (
              <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700">{saveError}</span>
              </div>
            )}

            <div className="p-5 space-y-5">
              {newStep === 1 && (
                <>
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <PawPrint className="w-5 h-5 text-primary-500" />
                    宠物基本信息
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        宠物名字 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newPet.name}
                        onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                        className="input"
                        placeholder="请输入宠物名字"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        种类 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newPet.species}
                        onChange={(e) => setNewPet({ ...newPet, species: e.target.value as any })}
                        className="input"
                      >
                        <option value="dog">狗狗</option>
                        <option value="cat">猫咪</option>
                        <option value="other">其他</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        品种
                      </label>
                      <input
                        type="text"
                        value={newPet.breed}
                        onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                        className="input"
                        placeholder="如：金毛、布偶"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        年龄（岁）
                      </label>
                      <input
                        type="number"
                        value={newPet.age}
                        onChange={(e) => setNewPet({ ...newPet, age: Number(e.target.value) })}
                        className="input"
                        min="0"
                        max="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        性别
                      </label>
                      <select
                        value={newPet.gender}
                        onChange={(e) => setNewPet({ ...newPet, gender: e.target.value as any })}
                        className="input"
                      >
                        <option value="male">公</option>
                        <option value="female">母</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {newStep === 2 && (
                <>
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" />
                    主人信息
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        主人姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newOwner.name}
                        onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                        className="input"
                        placeholder="请输入主人姓名"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        联系电话 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={newOwner.phone}
                        onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                        className="input"
                        placeholder="请输入联系电话"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        微信号
                      </label>
                      <input
                        type="text"
                        value={newOwner.wechat}
                        onChange={(e) => setNewOwner({ ...newOwner, wechat: e.target.value })}
                        className="input"
                        placeholder="选填"
                      />
                    </div>
                  </div>
                </>
              )}

              {newStep === 3 && (
                <>
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary-500" />
                    入住信息
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        门店
                      </label>
                      <select
                        value={newCheckIn.storeId}
                        onChange={(e) => setNewCheckIn({ ...newCheckIn, storeId: e.target.value, cageNumber: '' })}
                        className="input"
                      >
                        {stores.map(store => (
                          <option key={store.id} value={store.id}>{store.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        笼位选择 <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-400 ml-2">
                          空笼位：{availableCages.length} 个
                        </span>
                      </label>
                      <select
                        value={newCheckIn.cageNumber}
                        onChange={(e) => {
                          setNewCheckIn({ ...newCheckIn, cageNumber: e.target.value });
                          setSaveError(null);
                        }}
                        className={`input ${
                          newCheckIn.cageNumber && isCageOccupied(newCheckIn.storeId, newCheckIn.cageNumber)
                            ? 'border-red-300 bg-red-50'
                            : ''
                        }`}
                      >
                        <option value="">请选择笼位</option>
                        {availableCages.length > 0 ? (
                          availableCages.map(cage => (
                            <option key={cage} value={cage}>笼位 {cage}（空）</option>
                          ))
                        ) : (
                          <option value="" disabled>暂无空笼位</option>
                        )}
                      </select>
                      {newCheckIn.cageNumber && isCageOccupied(newCheckIn.storeId, newCheckIn.cageNumber) && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          该笼位已被占用
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        入住日期
                      </label>
                      <input
                        type="date"
                        value={newCheckIn.checkInDate}
                        onChange={(e) => setNewCheckIn({ ...newCheckIn, checkInDate: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        预计离店日期 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newCheckIn.expectedCheckOutDate}
                        onChange={(e) => setNewCheckIn({ ...newCheckIn, expectedCheckOutDate: e.target.value })}
                        className="input"
                        min={newCheckIn.checkInDate}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        每日费用（元）
                      </label>
                      <input
                        type="number"
                        value={newCheckIn.dailyRate}
                        onChange={(e) => setNewCheckIn({ ...newCheckIn, dailyRate: Number(e.target.value) })}
                        className="input"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        押金（元）
                      </label>
                      <input
                        type="number"
                        value={newCheckIn.deposit}
                        onChange={(e) => setNewCheckIn({ ...newCheckIn, deposit: Number(e.target.value) })}
                        className="input"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        特殊要求
                      </label>
                      <textarea
                        value={newCheckIn.specialRequirements}
                        onChange={(e) => setNewCheckIn({ ...newCheckIn, specialRequirements: e.target.value })}
                        className="input min-h-[80px] resize-none"
                        placeholder="例如：每天需要遛狗2次，对某些食物过敏等"
                      />
                    </div>
                  </div>

                  {newCheckIn.checkInDate && newCheckIn.expectedCheckOutDate && (
                    <div className="bg-primary-50 rounded-xl p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">预计入住天数：</span>
                        <span className="font-bold text-primary-600 text-lg">
                          {calculateDays(newCheckIn.checkInDate, newCheckIn.expectedCheckOutDate)} 天
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600">预计总费用：</span>
                        <span className="font-bold text-gray-800 text-lg">
                          ¥{calculateDays(newCheckIn.checkInDate, newCheckIn.expectedCheckOutDate) * newCheckIn.dailyRate}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {newStep === 4 && (
                <>
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <PawPrint className="w-5 h-5 text-primary-500" />
                    喂养方案配置
                  </h4>
                  <p className="text-sm text-gray-500">
                    配置默认喂养方案，喂食任务将自动使用此配置扣减库存
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        粮食类型
                      </label>
                      <select
                        value={newFeedingPlan.foodType}
                        onChange={(e) => setNewFeedingPlan({ ...newFeedingPlan, foodType: e.target.value as any })}
                        className="input"
                      >
                        <option value="dry">干粮</option>
                        <option value="wet">湿粮</option>
                        <option value="raw">生骨肉</option>
                        <option value="prescription">处方粮</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        关联库存
                      </label>
                      <select
                        value={newFeedingPlan.inventoryId || ''}
                        onChange={(e) => setNewFeedingPlan({ 
                          ...newFeedingPlan, 
                          inventoryId: e.target.value || undefined,
                          foodBrand: e.target.value 
                            ? (foodInventoryItems.find(f => f.id === e.target.value)?.name || '')
                            : newFeedingPlan.foodBrand
                        })}
                        className="input"
                      >
                        <option value="">不关联（可选）</option>
                        {foodInventoryItems.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name}（剩{item.quantity}{item.unit}）
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        品牌名称
                      </label>
                      <input
                        type="text"
                        value={newFeedingPlan.foodBrand}
                        onChange={(e) => setNewFeedingPlan({ ...newFeedingPlan, foodBrand: e.target.value })}
                        className="input"
                        placeholder="例如：渴望、皇家"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        每餐食量（克）
                      </label>
                      <input
                        type="number"
                        value={newFeedingPlan.defaultAmount}
                        onChange={(e) => setNewFeedingPlan({ ...newFeedingPlan, defaultAmount: Number(e.target.value) })}
                        className="input"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        每日用餐次数
                      </label>
                      <div className="flex gap-2">
                        {[2, 3, 4].map(n => (
                          <button
                            key={n}
                            onClick={() => setNewFeedingPlan({ ...newFeedingPlan, dailyMeals: n })}
                            className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                              newFeedingPlan.dailyMeals === n
                                ? 'border-primary-500 bg-primary-50 text-primary-600'
                                : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            {n} 餐/天
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        喂养备注
                      </label>
                      <textarea
                        value={newFeedingPlan.specialNotes}
                        onChange={(e) => setNewFeedingPlan({ ...newFeedingPlan, specialNotes: e.target.value })}
                        className="input min-h-[60px] resize-none"
                        placeholder="例如：饭前需要泡软，饭后半小时不要剧烈运动等"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
              {newStep > 1 ? (
                <button
                  onClick={() => { setNewStep(newStep - 1); setSaveError(null); }}
                  className="btn-outline flex-1"
                >
                  上一步
                </button>
              ) : (
                <button
                  onClick={() => setShowNewModal(false)}
                  className="btn-outline flex-1"
                >
                  取消
                </button>
              )}
              {newStep < 4 ? (
                <button
                  onClick={() => { setNewStep(newStep + 1); setSaveError(null); }}
                  className="btn-secondary flex-1"
                >
                  下一步
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!newCheckIn.cageNumber}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  确认入住
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
