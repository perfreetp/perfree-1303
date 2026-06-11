import { useState, useMemo } from 'react';
import {
  Heart,
  Thermometer,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  Plus,
  Calendar,
  Clock,
  Pill,
  Droplets,
  Activity,
  Search,
  X,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { MentalStatus, Appetite, BowelMovement } from '../../data/types';

const mentalStatusConfig: Record<MentalStatus, { label: string; icon: any; color: string }> = {
  excellent: { label: '非常好', icon: Smile, color: 'text-green-500 bg-green-50' },
  good: { label: '良好', icon: Smile, color: 'text-green-400 bg-green-50' },
  normal: { label: '一般', icon: Meh, color: 'text-yellow-500 bg-yellow-50' },
  poor: { label: '较差', icon: Frown, color: 'text-orange-500 bg-orange-50' },
  critical: { label: '危险', icon: Frown, color: 'text-red-500 bg-red-50' },
};

const appetiteConfig: Record<Appetite, { label: string; color: string }> = {
  excellent: { label: '旺盛', color: 'text-green-600' },
  good: { label: '良好', color: 'text-green-500' },
  normal: { label: '正常', color: 'text-gray-600' },
  poor: { label: '较差', color: 'text-orange-500' },
  none: { label: '绝食', color: 'text-red-500' },
};

const bowelConfig: Record<BowelMovement, { label: string; color: string }> = {
  normal: { label: '正常', color: 'text-green-600' },
  soft: { label: '偏软', color: 'text-yellow-600' },
  diarrhea: { label: '腹泻', color: 'text-orange-500' },
  constipated: { label: '便秘', color: 'text-red-500' },
  none: { label: '无', color: 'text-gray-500' },
};

export default function Health() {
  const { healthRecords, pets, checkIns, getActiveCheckIns, addHealthRecord, addMessage, employees, currentUserId } = useAppStore();
  const [selectedPetId, setSelectedPetId] = useState<string | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newRecord, setNewRecord] = useState({
    checkInId: '',
    temperature: 38.5,
    mentalStatus: 'normal' as MentalStatus,
    appetite: 'normal' as Appetite,
    bowelMovement: 'normal' as BowelMovement,
    medication: '',
    notes: '',
    notifyOwner: false,
  });

  const activeCheckIns = getActiveCheckIns();
  
  const recordsWithDetails = useMemo(() => {
    return healthRecords
      .map(record => {
        const checkIn = checkIns.find(c => c.id === record.checkInId);
        const pet = checkIn ? pets.find(p => p.id === checkIn.petId) : undefined;
        return { ...record, pet, checkIn };
      })
      .filter(r => r.pet && r.checkIn)
      .sort((a, b) => b.recordDate.localeCompare(a.recordDate));
  }, [healthRecords, checkIns, pets]);

  const filteredRecords = useMemo(() => {
    return recordsWithDetails.filter(record => {
      const matchesPet = selectedPetId === 'all' || record.checkIn?.petId === selectedPetId;
      const matchesSearch = record.pet?.name.includes(searchQuery) || record.notes?.includes(searchQuery);
      return matchesPet && matchesSearch;
    });
  }, [recordsWithDetails, selectedPetId, searchQuery]);

  const abnormalCount = recordsWithDetails.filter(r => r.isAbnormal).length;
  const todayRecords = recordsWithDetails.filter(r => r.recordDate === new Date().toISOString().split('T')[0]).length;

  const handleSubmit = () => {
    if (!newRecord.checkInId) return;

    const isAbnormal = newRecord.temperature > 39.5 || 
                       newRecord.temperature < 37.5 ||
                       newRecord.mentalStatus === 'poor' ||
                       newRecord.mentalStatus === 'critical' ||
                       newRecord.appetite === 'poor' ||
                       newRecord.appetite === 'none';

    addHealthRecord({
      checkInId: newRecord.checkInId,
      recordDate: new Date().toISOString().split('T')[0],
      temperature: newRecord.temperature,
      mentalStatus: newRecord.mentalStatus,
      appetite: newRecord.appetite,
      bowelMovement: newRecord.bowelMovement,
      medication: newRecord.medication || undefined,
      notes: newRecord.notes || undefined,
      isAbnormal,
    });

    if (newRecord.notifyOwner) {
      const checkIn = activeCheckIns.find(c => c.id === newRecord.checkInId);
      const employee = employees.find(e => e.id === currentUserId);
      if (checkIn && employee) {
        addMessage({
          checkInId: newRecord.checkInId,
          senderType: 'staff',
          senderName: employee.name,
          content: `健康观察记录：体温${newRecord.temperature}°C，精神状态${mentalStatusConfig[newRecord.mentalStatus].label}，食欲${appetiteConfig[newRecord.appetite].label}。${newRecord.notes ? `备注：${newRecord.notes}` : ''}`,
        });
      }
    }

    setShowAddModal(false);
    setNewRecord({
      checkInId: '',
      temperature: 38.5,
      mentalStatus: 'normal',
      appetite: 'normal',
      bowelMovement: 'normal',
      medication: '',
      notes: '',
      notifyOwner: false,
    });
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 39.5 || temp < 37.5) return 'text-red-500';
    if (temp > 39) return 'text-orange-500';
    return 'text-green-500';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">健康观察</h1>
          <p className="text-gray-500 mt-1">记录和监控宠物健康状态</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          添加记录
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">今日记录</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{todayRecords}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">异常提醒</p>
              <p className="text-3xl font-bold text-red-500 mt-1">{abnormalCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">在住宠物</p>
              <p className="text-3xl font-bold text-secondary-600 mt-1">{activeCheckIns.length}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-secondary-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">累计记录</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{healthRecords.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索宠物名称或备注..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedPetId('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPetId === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            全部宠物
          </button>
          {activeCheckIns.slice(0, 6).map(checkIn => (
            <button
              key={checkIn.id}
              onClick={() => setSelectedPetId(checkIn.petId)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedPetId === checkIn.petId
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <img
                src={checkIn.pet.photoUrl}
                alt={checkIn.pet.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              {checkIn.pet.name}
            </button>
          ))}
        </div>
      </div>

      {abnormalCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse-soft">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800">健康异常提醒</h4>
              <p className="text-sm text-red-600 mt-1">
                有 {abnormalCount} 条异常健康记录需要关注，请及时处理并联系宠物主人。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRecords.map((record, index) => {
          const mentalConfig = mentalStatusConfig[record.mentalStatus];
          const MentalIcon = mentalConfig.icon;
          const appetiteCfg = appetiteConfig[record.appetite];
          const bowelCfg = bowelConfig[record.bowelMovement];

          return (
            <div
              key={record.id}
              className={`card p-5 animate-slide-up ${
                record.isAbnormal ? 'border-red-200 bg-red-50/50' : ''
              }`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start gap-4">
                <img
                  src={record.pet?.photoUrl}
                  alt={record.pet?.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">{record.pet?.name}</h4>
                      {record.isAbnormal && (
                        <span className="badge bg-red-100 text-red-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          异常
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(record.recordDate)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    笼位 {record.checkIn?.cageNumber}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Thermometer className={`w-4 h-4 ${getTemperatureColor(record.temperature)}`} />
                      <span className="text-sm text-gray-600">体温</span>
                      <span className={`text-sm font-semibold ${getTemperatureColor(record.temperature)}`}>
                        {record.temperature.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MentalIcon className={`w-4 h-4 ${mentalConfig.color.split(' ')[0]}`} />
                      <span className="text-sm text-gray-600">精神</span>
                      <span className={`text-sm font-semibold ${mentalConfig.color.split(' ')[0]}`}>
                        {mentalConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smile className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">食欲</span>
                      <span className={`text-sm font-semibold ${appetiteCfg.color}`}>
                        {appetiteCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">排便</span>
                      <span className={`text-sm font-semibold ${bowelCfg.color}`}>
                        {bowelCfg.label}
                      </span>
                    </div>
                  </div>

                  {record.medication && (
                    <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-2 mb-2">
                      <Pill className="w-4 h-4 text-blue-500 mt-0.5" />
                      <span className="text-sm text-blue-700">{record.medication}</span>
                    </div>
                  )}

                  {record.notes && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                      {record.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <p className="text-gray-500">暂无健康记录</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">添加健康记录</h3>
              <button
                onClick={() => setShowAddModal(false)}
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
                  value={newRecord.checkInId}
                  onChange={(e) => setNewRecord({ ...newRecord, checkInId: e.target.value })}
                  className="input"
                >
                  <option value="">请选择宠物</option>
                  {activeCheckIns.map(checkIn => (
                    <option key={checkIn.id} value={checkIn.id}>
                      {checkIn.pet.name} - {checkIn.pet.breed}（笼位 {checkIn.cageNumber}）
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  体温（°C）<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="36"
                    max="42"
                    step="0.1"
                    value={newRecord.temperature}
                    onChange={(e) => setNewRecord({ ...newRecord, temperature: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className={`text-xl font-bold min-w-[60px] text-center ${getTemperatureColor(newRecord.temperature)}`}>
                    {newRecord.temperature.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">正常范围：37.5°C - 39.5°C</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  精神状态 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(mentalStatusConfig) as MentalStatus[]).map(status => {
                    const cfg = mentalStatusConfig[status];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => setNewRecord({ ...newRecord, mentalStatus: status })}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                          newRecord.mentalStatus === status
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${cfg.color.split(' ')[0]}`} />
                        <span className="text-xs">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    食欲 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(appetiteConfig) as Appetite[]).map(status => (
                      <button
                        key={status}
                        onClick={() => setNewRecord({ ...newRecord, appetite: status })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          newRecord.appetite === status
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {appetiteConfig[status].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    排便情况 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(bowelConfig) as BowelMovement[]).map(status => (
                      <button
                        key={status}
                        onClick={() => setNewRecord({ ...newRecord, bowelMovement: status })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          newRecord.bowelMovement === status
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {bowelConfig[status].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用药情况
                </label>
                <div className="relative">
                  <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={newRecord.medication}
                    onChange={(e) => setNewRecord({ ...newRecord, medication: e.target.value })}
                    className="input pl-10"
                    placeholder="例如：退烧药，每日两次"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  className="input min-h-[80px] resize-none"
                  placeholder="记录其他观察到的情况..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifyOwner"
                  checked={newRecord.notifyOwner}
                  onChange={(e) => setNewRecord({ ...newRecord, notifyOwner: e.target.checked })}
                  className="w-4 h-4 text-primary-500 rounded"
                />
                <label htmlFor="notifyOwner" className="text-sm text-gray-600">
                  同时发送消息通知主人
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-outline flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newRecord.checkInId}
                className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
