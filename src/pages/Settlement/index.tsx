import { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Home,
  CreditCard,
  Calendar,
  Store,
  FileText,
  CheckCircle2,
  Clock,
  X,
  Eye,
  Receipt,
  Percent,
  Users,
  PawPrint,
  ChevronDown,
  ChevronUp,
  Download,
  BarChart3,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppStore } from '../../store/appStore';
import { PaymentStatus } from '../../data/types';

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待支付', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  paid: { label: '已支付', color: 'text-green-600', bgColor: 'bg-green-100' },
  refunded: { label: '已退款', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

const STORE_COLORS = ['#FF7A45', '#2D6A4F', '#40916C'];

export default function Settlement() {
  const { bills, checkIns, pets, owners, stores, occupancyData, revenueData, getDashboardStats, payBill } = useAppStore();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'bills'>('overview');
  const [expandedBill, setExpandedBill] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | 'all'>('all');

  const dashboardStats = getDashboardStats();

  const billsWithDetails = useMemo(() => {
    return bills.map(bill => {
      const checkIn = checkIns.find(c => c.id === bill.checkInId);
      const pet = checkIn ? pets.find(p => p.id === checkIn.petId) : undefined;
      const owner = checkIn ? owners.find(o => o.id === checkIn.ownerId) : undefined;
      const store = checkIn ? stores.find(s => s.id === checkIn.storeId) : undefined;
      return { ...bill, checkIn, pet, owner, store };
    }).filter(b => selectedStoreId === 'all' || b.store?.id === selectedStoreId)
      .sort((a, b) => {
        if (a.paymentStatus === 'pending' && b.paymentStatus !== 'pending') return -1;
        if (a.paymentStatus !== 'pending' && b.paymentStatus === 'pending') return 1;
        return 0;
      });
  }, [bills, checkIns, pets, owners, stores, selectedStoreId]);

  const stats = useMemo(() => {
    const totalRevenue = bills.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);
    const pendingAmount = bills.filter(b => b.paymentStatus === 'pending').reduce((sum, b) => sum + b.totalAmount, 0);
    const avgOrderValue = bills.length > 0 ? Math.round(totalRevenue / bills.filter(b => b.paymentStatus === 'paid').length) : 0;
    const paidCount = bills.filter(b => b.paymentStatus === 'paid').length;
    const pendingCount = bills.filter(b => b.paymentStatus === 'pending').length;
    
    return { totalRevenue, pendingAmount, avgOrderValue, paidCount, pendingCount };
  }, [bills]);

  const storeOccupancyData = useMemo(() => {
    return stores.map((store, index) => ({
      name: store.name,
      入住率: store.totalCages > 0 ? Math.round((store.occupiedCages / store.totalCages) * 100) : 0,
      容量: store.totalCages,
      在住: store.occupiedCages,
      color: STORE_COLORS[index % STORE_COLORS.length],
    }));
  }, [stores]);

  const pieData = useMemo(() => {
    return storeOccupancyData.map(d => ({
      name: d.name,
      value: d.在住,
      color: d.color,
    }));
  }, [storeOccupancyData]);

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const chartData = useMemo(() => {
    return revenueData.map(d => ({
      ...d,
      date: d.date.slice(5),
    }));
  }, [revenueData]);

  const occupancyChartData = useMemo(() => {
    return occupancyData.map(d => ({
      ...d,
      date: d.date.slice(5),
      入住率: Math.round((d.occupancy / d.capacity) * 100),
    }));
  }, [occupancyData]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">结算统计</h1>
          <p className="text-gray-500 mt-1">查看营收数据和账单管理</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="input pl-10 pr-8 appearance-none"
            >
              <option value="all">全部门店</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedTab === 'overview'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          数据概览
        </button>
        <button
          onClick={() => setSelectedTab('bills')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedTab === 'bills'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Receipt className="w-4 h-4 inline mr-2" />
          账单管理
        </button>
      </div>

      {selectedTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">累计营收</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>较上月 +12.5%</span>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">待收款</p>
                  <p className="text-3xl font-bold text-orange-500 mt-1">{formatCurrency(stats.pendingAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                {stats.pendingCount} 笔待支付订单
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">平均客单价</p>
                  <p className="text-3xl font-bold text-secondary-600 mt-1">{formatCurrency(stats.avgOrderValue)}</p>
                </div>
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-secondary-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>较上月 +8.3%</span>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">整体入住率</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{dashboardStats.occupancyRate}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                <PawPrint className="w-4 h-4 inline mr-1" />
                {dashboardStats.totalPets} 只宠物在住
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                近7日营收趋势
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF7A45" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF7A45" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => [`¥${value}`, '营收']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#FF7A45"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-secondary-500" />
                近14日入住率趋势
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={occupancyChartData}>
                    <defs>
                      <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => [`${value}%`, '入住率']}
                    />
                    <Area
                      type="monotone"
                      dataKey="入住率"
                      stroke="#2D6A4F"
                      strokeWidth={2}
                      fill="url(#colorOccupancy)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-500" />
                各门店入住率对比
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storeOccupancyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} unit="%" />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === '入住率') return [`${value}%`, name];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="入住率" radius={[0, 4, 4, 0]}>
                      {storeOccupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                在住宠物分布
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => [`${value} 只`, '在住宠物']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {storeOccupancyData.map((store, index) => (
                  <div key={store.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: store.color }} />
                    <span className="text-sm text-gray-600">{store.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary-500" />
              各门店数据详情
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">门店</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">总笼位</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">在住宠物</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">入住率</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">入住率进度</th>
                  </tr>
                </thead>
                <tbody>
                  {storeOccupancyData.map((store, index) => (
                    <tr key={store.name} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${store.color}20` }}>
                            <Store className="w-5 h-5" style={{ color: store.color }} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{store.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4 text-gray-600">{store.容量}</td>
                      <td className="text-center py-4 px-4 font-semibold text-gray-800">{store.在住}</td>
                      <td className="text-center py-4 px-4">
                        <span className={`font-bold ${store.入住率 >= 80 ? 'text-green-600' : store.入住率 >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {store.入住率}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-full max-w-[200px] mx-auto">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${store.入住率}%`, backgroundColor: store.color }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                共 {billsWithDetails.length} 条账单，其中待支付 {stats.pendingCount} 条
              </span>
            </div>
            <button className="btn-outline text-sm">
              <Download className="w-4 h-4 mr-2" />
              导出账单
            </button>
          </div>

          <div className="space-y-3">
            {billsWithDetails.map((bill, index) => {
              const statusConfig = paymentStatusConfig[bill.paymentStatus];
              const isExpanded = expandedBill === bill.id;

              return (
                <div
                  key={bill.id}
                  className="card animate-slide-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div
                    onClick={() => setExpandedBill(isExpanded ? null : bill.id)}
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {bill.pet && (
                          <img
                            src={bill.pet.photoUrl}
                            alt={bill.pet.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-800">
                              {bill.pet?.name || '未知宠物'}
                            </h4>
                            <span className={`badge ${statusConfig.bgColor} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {bill.owner?.name || '未知主人'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Store className="w-3 h-3" />
                              {bill.store?.name || '未知门店'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {bill.paymentDate ? formatDate(bill.paymentDate) : '未支付'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">
                            {formatCurrency(bill.totalAmount)}
                          </div>
                          {bill.paymentMethod && (
                            <div className="text-sm text-gray-500">{bill.paymentMethod}</div>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-4 animate-fade-in">
                      <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        账单明细
                      </h5>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        {bill.items.map((item, i) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">{item.description}</span>
                              {item.quantity > 1 && (
                                <span className="text-gray-400">x{item.quantity}</span>
                              )}
                            </div>
                            <span className={`font-medium ${item.amount < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                              {item.amount < 0 ? '-' : ''}{formatCurrency(Math.abs(item.amount))}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">基础费用</span>
                          <span className="text-gray-800">{formatCurrency(bill.baseAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">加购服务</span>
                          <span className="text-gray-800">{formatCurrency(bill.addonAmount)}</span>
                        </div>
                        {bill.discount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              优惠折扣
                            </span>
                            <span className="text-red-500">-{formatCurrency(bill.discount)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="font-semibold text-gray-800">应付总额</span>
                          <span className="text-xl font-bold text-primary-600">
                            {formatCurrency(bill.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {bill.paymentStatus === 'pending' && (
                        <div className="mt-4 flex gap-3">
                          <button 
                            className="btn-secondary flex-1"
                            onClick={() => payBill(bill.id, '微信支付')}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            确认收款
                          </button>
                          <button className="btn-outline flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            发送账单
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {billsWithDetails.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-gray-500">暂无账单记录</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
