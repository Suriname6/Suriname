import React, {useCallback, useEffect, useState} from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import {TrendingUp, TrendingDown, Users, Clock, DollarSign, AlertCircle, CheckCircle, Target} from 'lucide-react';
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";

// CustomTooltip 컴포넌트가 있다면 그대로 사용
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
        <div style={{ background: 'white', border: '1px solid #ccc', padding: '10px' }}>
          <p>{`${label} : ${payload[0].value}`}</p>
        </div>
    );
  }
  return null;
};

// 커스텀 Card 컴포넌트들
const Card = ({ children, className = "", hover = false }) => {
  return (
      <div
          className={`
        backdrop-blur-xl bg-white/80 
        border border-white/20 
        rounded-3xl shadow-2xl shadow-blue-500/10
        ${hover ? 'hover:shadow-3xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer' : ''}
        ${className}
      `}
      >
        {children}
      </div>
  );
};

const CardHeader = ({ children, className = "" }) => {
  return (
      <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
        {children}
      </div>
  );
};

const CardTitle = ({ children, className = "" }) => {
  return (
      <h3 className={`text-xl font-semibold leading-none tracking-tight text-gray-900 ${className}`}>
        {children}
      </h3>
  );
};

const CardContent = ({ children, className = "" }) => {
  return (
      <div className={`p-6 pt-0 ${className}`}>
        {children}
      </div>
  );
};

// Input 컴포넌트
const Input = ({ className = "", ...props }) => {
  return (
      <input
          className={`
        flex h-10 w-full rounded-md border border-gray-200 
        bg-white px-3 py-2 text-sm placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
          {...props}
      />
  );
};

// 샘플 데이터
const dailyTrendData = [
  { date: '01/01', count: 15, completed: 12 },
  { date: '01/02', count: 23, completed: 19 },
  { date: '01/03', count: 18, completed: 15 },
  { date: '01/04', count: 32, completed: 28 },
  { date: '01/05', count: 28, completed: 25 },
  { date: '01/06', count: 19, completed: 16 },
  { date: '01/07', count: 25, completed: 22 },
];

const monthlyTrendData = [
  { month: '1월', count: 450, revenue: 12500 },
  { month: '2월', count: 520, revenue: 15200 },
  { month: '3월', count: 480, revenue: 13800 },
  { month: '4월', count: 590, revenue: 18900 },
  { month: '5월', count: 620, revenue: 21200 },
  { month: '6월', count: 580, revenue: 19800 },
];

const statusDistributionData = [
  { name: '접수', value: 45, count: 45, color: '#3B82F6' },
  { name: '수리중', value: 35, count: 35, color: '#F59E0B' },
  { name: '입금대기', value: 25, count: 25, color: '#EF4444' },
  { name: '배송대기', value: 15, count: 15, color: '#8B5CF6' },
  { name: '완료', value: 280, count: 280, color: '#10B981' }
];

const productRankingData = [
  { product: '삼성 세탁기', count: 45, trend: 'up' },
  { product: 'LG 냉장고', count: 38, trend: 'up' },
  { product: '삼성 에어컨', count: 32, trend: 'down' },
  { product: 'LG 세탁기', count: 28, trend: 'up' },
  { product: '삼성 TV', count: 25, trend: 'down' },
  { product: 'LG 에어컨', count: 22, trend: 'up' },
];

// const performanceData = [
//     { name: '처리 속도', current: 85, target: 90 },
//     { name: '고객 만족도', current: 92, target: 95 },
//     { name: '완료율', current: 78, target: 85 },
//     { name: '재수리율', current: 12, target: 8 },
// ];
// <PerformanceRing
//     data={performanceData}
//     title="성과 지표"
// />

const statisticsData = [
  {
    icon: Users,
    title: 'A/S 접수 건수',
    value: '1,247',
    change: '+12.5%',
    description: '총 건수, 전월 대비 증감율'
  },
  {
    icon: Clock,
    title: '오늘 접수 건수',
    value: '28',
    change: '+5.2%',
    description: '당일 접수, 어제 대비 증감'
  },
  {
    icon: AlertCircle,
    title: '미완료 건수',
    value: '186',
    change: '-3.1%',
    description: '진행중 + 대기중 건수'
  },
  {
    icon: CheckCircle,
    title: '전체 완료율',
    value: '85.1%',
    change: '+2.3%',
    description: '완료율 %, 목표 대비 달성률'
  },
  {
    icon: DollarSign,
    title: '총 매출액',
    value: '₩24.5M',
    change: '+15.2%',
    description: '월 매출, 전월 대비 증감'
  },
  {
    icon: DollarSign,
    title: '평균 수리비',
    value: '₩185K',
    change: '-4.8%',
    description: '평균 수리비, 전월 대비 변화'
  }
];

// 기존 구조와 동일한 전체 대시보드
export default function AdminDashboard() {
  // 상태 관리: 현재 선택된 기간
  const [period, setPeriod] = useState('monthly'); // 기본값은 월별로
  // 상태 관리: 그래프 데이터
  const [chartData, setChartData] = useState([]);

  const fetchSalesTrendData = useCallback(async () => {
    try {
      // ⭐ 중요: 이 API 엔드포인트는 백엔드에서 period에 따라 데이터를 다르게 주는 엔드포인트여야 해!
      // 지금은 임시로 '/api/sales-trend'라고 할게.
      // 네 `analyticsService.getSummary`가 만약 이런 트렌드 데이터를 준다면 그걸 쓰면 돼!
      const response = await fetch(`/api/sales-trend?period=${period}`);
      // `analyticsService.getSummary`가 summary 데이터를 줄 거니까
      // 그 서비스에 `getTrendData(period)` 같은 메서드를 추가해야 할 거야!

      if (!response.ok) {
        throw new Error('매출 추이 데이터를 불러오는데 실패했습니다.');
      }
      const data = await response.json();

      // 데이터 형태를 그래프에 맞게 변환해야 할 수도 있어.
      // 예를 들어, 백엔드에서 받아온 데이터가 [{date: '2025-01-01', revenue: 100}, ...] 형태라면 그대로 사용.
      // 만약 형태가 다르다면 여기에 매핑 로직 필요.
      setChartData(data); // 데이터를 상태에 저장
    } catch (error) {
      console.error("매출 추이 데이터 로드 에러:", error);
      setChartData([]); // 에러 발생 시 데이터 비우기
    }
  }, [period]); // period가 바뀔 때마다 fetch 함수 재생성

  // 컴포넌트 마운트 시, 또는 period가 변경될 때 데이터 다시 불러오기
  useEffect(() => {
    fetchSalesTrendData();
  }, [fetchSalesTrendData]);

  // 드롭다운 변경 핸들러
  const handleChangePeriod = (event) => {
    setPeriod(event.target.value);
  };

  // XAxis의 dataKey와 Tooltip의 label은 period에 따라 달라질 수 있어!
  // 예를 들어, 'daily'면 dataKey는 'date', 'monthly'면 'month'
  const getXAxisDataKey = () => {
    switch (period) {
      case 'daily': return 'date';
      case 'weekly': return 'week';
      case 'monthly': return 'month';
      case 'yearly': return 'year';
      default: return 'date'; // 기본값
    }
  };
  // 차트 제목도 동적으로 변경
  const getChartTitle = () => {
    switch (period) {
      case 'daily': return '일별 매출 추이';
      case 'weekly': return '주별 매출 추이';
      case 'monthly': return '월별 매출 추이';
      case 'yearly': return '년별 매출 추이';
      default: return '매출 추이';
    }
  };

  // Modern Donut Chart
  const ModernDonutChart = ({ data, title }) => (
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="relative">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
              >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {data.reduce((sum, item) => sum + item.value, 0)}
              </p>
              <p className="text-sm text-gray-500">총 건수</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-lg font-bold" style={{ color: item.color }}>
                    {item.count}건
                  </p>
                </div>
              </div>
          ))}
        </div>
      </Card>
  );

// Modern Area Chart
  const ModernAreaChart = ({ data, title, dataKeys }) => (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <div className="flex gap-4">
            {dataKeys.map((key, index) => (
                <div key={key.key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: key.color }} />
                  <span className="text-sm font-medium text-gray-600">{key.name}</span>
                </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCount)"
            />
            <Area
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCompleted)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
  );

// Modern Bar Chart with Trends
  const ModernBarChart = ({ data, title }) => (
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="space-y-4">
          {data.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.product}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{item.count}건</span>
                      {item.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${
                            item.trend === 'up' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${(item.count / 50) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
          ))}
        </div>
      </Card>
  );

// Performance Ring Chart
  const PerformanceRing = ({ data, title }) => (
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="grid grid-cols-2 gap-6">
          {data.map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                    />
                    <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeDasharray={`${item.current}, 100`}
                        className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">{item.current}%</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600">{item.name}</p>
                <p className="text-xs text-gray-400">목표: {item.target}%</p>
              </div>
          ))}
        </div>
      </Card>
  );

// StatisticsSection 컴포넌트
  const StatisticsSection = () => {
    return (
        <div className="space-y-8">
          {/* 핵심 지표 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statisticsData.map((stat, index) => (
                <Card key={index} hover className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      <TrendingUp className="w-4 h-4" />
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </Card>
            ))}
          </div>
        </div>
    );
  };

// ChartSection 컴포넌트
  const ChartSection = () => {
    return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ModernDonutChart
                data={statusDistributionData}
                title="처리 단계별 현황"
            />
            <ModernBarChart
                data={productRankingData}
                title="제품별 A/S 건수 (TOP 6)"
            />
          </div>

          {/* 매출 트렌드 */}
          <Card className="p-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              {/* ⭐️ 차트 제목 ⭐️ */}
              <h3 className="text-xl font-bold text-gray-900">{getChartTitle()}</h3>

              {/* ⭐️ 기간 선택 드롭다운 ⭐️ */}
              <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel id="period-select-label">기간</InputLabel>
                <Select
                    labelId="period-select-label"
                    value={period}
                    onChange={handleChangePeriod}
                    label="기간"
                >
                  <MenuItem value="daily">일별</MenuItem>
                  <MenuItem value="weekly">주별</MenuItem>
                  <MenuItem value="monthly">월별</MenuItem>
                  <MenuItem value="yearly">년별</MenuItem>
                </Select>
              </FormControl>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}> {/* ⭐️ chartData로 변경! ⭐️ */}
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey={getXAxisDataKey()} stroke="#6B7280" fontSize={12} /> {/* ⭐️ dataKey 동적 변경! ⭐️ */}
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="revenue" // ⭐️ 'revenue' 필드는 모든 기간에서 동일하다고 가정! ⭐️
                    stroke="#8B5CF6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
    );
  };

  return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-row justify-center w-full min-h-screen">
        <div className="bg-transparent w-full max-w-[1440px] relative">
          <div className="flex">
            <main className="flex-1 p-6">
              <StatisticsSection /><br/>
              <ChartSection />
            </main>
          </div>
        </div>
      </div>
  );
};