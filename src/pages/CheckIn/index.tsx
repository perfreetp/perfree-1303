import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Phone,
  Syringe,
  FileText,
  X,
  Upload,
  Check,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Pet, CheckIn as CheckInType } from '../../data/types';

export default function CheckIn() {
  const {
    getActiveCheckIns,
    checkIns,
    pets,
    owners,
    stores,
    addCheckInWithDetails,
    completeCheckIn,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<string | null>(null);

  const [newPet, setNewPet] = useState<Partial<Pet>>({
    name: '',
    species: 'dog',
    breed: '',
    age: 1,
    gender: 'male',
    photoUrl: '',
  });

  const [newOwner, setNewOwner] = useState({
    name: '',
    phone: '',
    wechat: '',
  });

  const [newCheckIn, setNewCheckIn] = useState<Partial<CheckInType>>({
    storeId: 'store-1',
    checkInDate: new Date().toISOString().split('T')[0],
    expectedCheckOutDate: '',
    cageNumber: '',
    specialRequirements: '',
    dailyRate: 108,
    deposit: 400,
  });

  const activeCheckIns = getActiveCheckIns().filter(ci => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ci.pet.name.toLowerCase().includes(query) ||
      ci.owner.name.toLowerCase().includes(query) ||
      ci.cageNumber.toLowerCase().includes(query)
    );
  });

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
        ci.owner.name.toLowerCase().includes(query)
      );
    });
  })();

  const displayCheckIns = activeTab === 'active' ? activeCheckIns : historyCheckIns;

  const handleSubmit = () => {
    if (!newPet.name || !newOwner.name || !newOwner.phone || !newCheckIn.expectedCheckOutDate || !newCheckIn.cageNumber) {
      return;
    }

    addCheckInWithDetails({
      pet: {
        name: newPet.name || '',
        species: newPet.species || 'dog',
        breed: newPet.breed || '',
        age: newPet.age || 1,
        gender: newPet.gender || 'male',
        photoUrl: newPet.photoUrl || '',
        vaccineRecords: [],
      },
      owner: {
        name: newOwner.name,
        phone: newOwner.phone,
        wechat: newOwner.wechat || undefined,
      },
      checkIn: {
        storeId: newCheckIn.storeId || 'store-1',
        checkInDate: newCheckIn.checkInDate || new Date().toISOString().split('T')[0],
        expectedCheckOutDate: newCheckIn.expectedCheckOutDate!,
        cageNumber: newCheckIn.cageNumber!,
        specialRequirements: newCheckIn.specialRequirements || '',
        dailyRate: newCheckIn.dailyRate || 108,
        deposit: newCheckIn.deposit || 400,
      },
    });

    setShowNewModal(false);
    setNewPet({ name: '', species: 'dog', breed: '', age: 1, gender: 'male', photoUrl: '' });
    setNewOwner({ name: '', phone: '', wechat: '' });
    setNewCheckIn({
      storeId: 'store-1',
      checkInDate: new Date().toISOString().split('T')[0],
      expectedCheckOutDate: '',
      cageNumber: '',
      specialRequirements: '',
      dailyRate: 108,
      deposit: 400,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">宠物入住</h1>
          <p className="text-gray-500 mt-1">管理宠物入住登记和离店手续</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增入住
        </button>
      </div>

      <div className="card p-1 flex items-center gap-1 w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          在住 ({activeCheckIns.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          历史记录 ({historyCheckIns.length})
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索宠物名称、主人姓名、笼位号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button className="btn-outline">
          <Filter className="w-4 h-4 mr-2" />
          筛选
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCheckIns.map((checkIn, index) => (
          <div
            key={checkIn.id}
            className="card p-5 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 30}ms` }}
            onClick={() => setSelectedCheckIn(selectedCheckIn === checkIn.id ? null : checkIn.id)}
          >
            <div className="flex items-start gap-4">
              <img
                src={checkIn.pet.photoUrl}
                alt={checkIn.pet.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-gray-800 truncate">
                    {checkIn.pet.name}
                  </h3>
                  <span className="text-lg">
                    {checkIn.pet.species === 'dog' ? '🐕' : '🐈'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{checkIn.pet.breed}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${
                    checkIn.status === 'active' ? 'badge-success' :
                    checkIn.status === 'completed' ? 'badge-info' : 'badge-danger'
                  }`}>
                    {checkIn.status === 'active' ? '在住' :
                     checkIn.status === 'completed' ? '已离店' : '已取消'}
                  </span>
                  <span className="badge-primary">{checkIn.cageNumber}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>{checkIn.owner.name}</span>
                <Phone className="w-4 h-4 text-gray-400 ml-2" />
                <span>{checkIn.owner.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  {checkIn.checkInDate} ~ {checkIn.expectedCheckOutDate}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{checkIn.store.name}</span>
              </div>
            </div>

            {checkIn.specialRequirements && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-800 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {checkIn.specialRequirements}
                </p>
              </div>
            )}

            {selectedCheckIn === checkIn.id && checkIn.status === 'active' && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button className="btn-outline flex-1 text-sm">
                  <FileText className="w-4 h-4 mr-1" />
                  查看详情
                </button>
                <button
                  className="btn-secondary flex-1 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    completeCheckIn(checkIn.id);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  办理离店
                </button>
              </div>
            )}

            {checkIn.pet.vaccineRecords?.some(v => v.isExpired) && (
              <div className="mt-3 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                有疫苗已过期
              </div>
            )}
          </div>
        ))}
      </div>

      {displayCheckIns.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500">暂无{activeTab === 'active' ? '在住' : '历史'}记录</p>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">新增入住登记</h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  宠物信息
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors cursor-pointer">
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                          <span className="text-xs text-gray-500 mt-1">上传照片</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            宠物名称 *
                          </label>
                          <input
                            type="text"
                            value={newPet.name}
                            onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                            className="input"
                            placeholder="请输入宠物名称"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              物种
                            </label>
                            <select
                              value={newPet.species}
                              onChange={(e) => setNewPet({ ...newPet, species: e.target.value as 'dog' | 'cat' | 'other' })}
                              className="input"
                            >
                              <option value="dog">狗狗</option>
                              <option value="cat">猫咪</option>
                              <option value="other">其他</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              性别
                            </label>
                            <select
                              value={newPet.gender}
                              onChange={(e) => setNewPet({ ...newPet, gender: e.target.value as 'male' | 'female' })}
                              className="input"
                            >
                              <option value="male">公</option>
                              <option value="female">母</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
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
                      placeholder="如：金毛、布偶等"
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
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  主人信息
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      主人姓名 *
                    </label>
                    <input
                      type="text"
                      value={newOwner.name}
                      onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                      className="input"
                      placeholder="请输入主人姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      联系电话 *
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
                      placeholder="请输入微信号"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  入住信息
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      入住门店
                    </label>
                    <select
                      value={newCheckIn.storeId}
                      onChange={(e) => setNewCheckIn({ ...newCheckIn, storeId: e.target.value })}
                      className="input"
                    >
                      {stores.map(store => (
                        <option key={store.id} value={store.id}>{store.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      笼位号 *
                    </label>
                    <input
                      type="text"
                      value={newCheckIn.cageNumber}
                      onChange={(e) => setNewCheckIn({ ...newCheckIn, cageNumber: e.target.value })}
                      className="input"
                      placeholder="如：A-01"
                    />
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
                      预计离店 *
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
                      日单价（元）
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
                      placeholder="请填写特殊喂养要求、健康状况、过敏史等重要信息"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Syringe className="w-5 h-5 text-primary-500" />
                  疫苗信息
                </h3>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>狂犬疫苗（有效期至 2027-01-15）</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>六联疫苗（有效期至 2027-02-20）</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="text-gray-800 font-medium">预计费用：</span>
                ¥{newCheckIn.dailyRate} × 天数 + 服务费用
              </div>
              <div className="flex gap-3">
                <button className="btn-outline" onClick={() => setShowNewModal(false)}>
                  取消
                </button>
                <button className="btn-primary" onClick={handleSubmit}>
                  <Check className="w-4 h-4 mr-2" />
                  确认入住
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
