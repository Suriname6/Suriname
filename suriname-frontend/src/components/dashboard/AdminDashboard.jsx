import React, {useCallback, useEffect, useState} from 'react';
import axios from 'axios';
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
  { name: '접수', key: 'receivedCount', value: 0, count: 0, color: '#3B82F6' },
  { name: '수리중', key: 'repairingCount', value: 0, count: 0, color: '#F59E0B' },
  { name: '입금대기', key: 'waitingForPaymentCount', value: 0, count: 0, color: '#EF4444' },
  { name: '배송대기', key: 'waitingForDeliveryCount', value: 0, count: 0, color: '#8B5CF6' },
  { name: '완료', key: 'completedCount', value: 0, count: 0, color: '#10B981' }
];

const productRankingData = [
  { product: '삼성 세탁기', count: 45, trend: 'up' },
  { product: 'LG 냉장고', count: 38, trend: 'up' },
  { product: '삼성 에어컨', count: 32, trend: 'down' },
  { product: 'LG 세탁기', count: 28, trend: 'up' },
  { product: '삼성 TV', count: 25, trend: 'down' },
  { product: 'LG 에어컨', count: 22, trend: 'up' },
];

const statisticsData = [
  {
    icon: Users, // 이 부분은 백엔드에서 안 주니까 그대로 유지
    title: 'A/S 접수 건수',
    key: 'totalRequestCount', // DTO에서 어떤 필드랑 매칭되는지 키를 추가하자
    value: '0', // 초기값, 나중에 백엔드 데이터로 채워짐
    change: '+12.5%', // 이것도 백엔드에서 안 주면 유지하거나, 아니면 빼야 해
    description: '총 건수, 전월 대비 증감율'
  },
  {
    icon: Clock,
    title: '오늘 접수 건수',
    key: 'todayRequestCount',
    value: '0',
    change: '+5.2%',
    description: '당일 접수, 어제 대비 증감'
  },
  {
    icon: AlertCircle,
    title: '미완료 건수',
    key: 'uncompletedCount', // 이 값은 totalRequestCount - completedCount 로 계산해야 함
    value: '0',
    change: '-3.1%',
    description: '진행중 + 대기중 건수'
  },
  {
    icon: CheckCircle,
    title: '전체 완료율',
    key: 'completedRatio',
    value: '0%',
    change: '+2.3%',
    description: '완료율 %, 목표 대비 달성률'
  },
  {
    icon: DollarSign,
    title: '총 매출액',
    key: 'totalRevenue',
    value: '₩0',
    change: '+15.2%',
    description: '월 매출, 전월 대비 증감'
  },
  {
    icon: DollarSign,
    title: '평균 수리비',
    key: 'averageRepairCost',
    value: '₩0',
    change: '-4.8%',
    description: '평균 수리비, 전월 대비 변화'
  }
];

// 숫자를 한국 화폐 형식으로 포맷하는 함수 (예: 1234567 -> 1,234,567)
const formatNumberWithCommas = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 숫자를 화폐 단위로 포맷하는 함수 (예: 24500000 -> ₩24.5M, 185000 -> ₩185K)
const formatKoreanCurrency = (amount) => {
  if (amount >= 1_000_000) {
    return `₩${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₩${(amount / 1_000).toFixed(0)}K`; // 천원 단위는 소수점 없이 K 붙이는게 일반적
  }
  return `₩${amount}`;
};

// 기존 구조와 동일한 전체 대시보드
export default function AdminDashboard() {
  // 상태 관리: 현재 선택된 기간
  const [period, setPeriod] = useState('monthly'); // 기본값은 월별로
  // 상태 관리: 카드 데이터
  const [cardData, setCardData] = useState([statisticsData]);
  // 상태 관리: 처리 단계별 현황
  const [statusData, setStatusData] = useState(statusDistributionData);
  // 상태 관리: 카테고리별 A/S 건수
  const [categoryAsCountData, setCategoryAsCountData] = useState([]);
  // 상태 관리: 매출 그래프 데이터
  const [chartData, setChartData] = useState([]);

  const fetchCardData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/analytics/statistics`);
      const backendData = response.data; // 백엔드에서 온 DTO 데이터

      // DTO 데이터를 받아서 기존 StatisticsData의 value만 업데이트!
      const updatedCardData = statisticsData.map(stat => {
        let newValue = stat.value; // 기본값은 기존 value로
        if (stat.key) { // DTO에서 해당하는 키가 있다면
          // 백엔드 데이터에 있는 필드 매핑
          if (backendData.hasOwnProperty(stat.key)) {
            const dataValue = backendData[stat.key];
            if (stat.key === 'totalRequestCount' || stat.key === 'todayRequestCount' || stat.key === 'uncompletedCount') {
              newValue = formatNumberWithCommas(dataValue); // 숫자 포맷팅
            } else if (stat.key === 'completedRatio') {
              newValue = `${(dataValue).toFixed(1)}%`; // 소수점 한자리 백분율로
            } else if (stat.key === 'totalRevenue' || stat.key === 'averageRepairCost') {
              newValue = formatKoreanCurrency(dataValue); // 한국 화폐 포맷팅
            } else {
              newValue = dataValue.toString(); // 그 외 일반적인 경우
            }
          }
        }
        return {
          ...stat, // 기존 아이콘, 제목 등은 그대로 유지
          value: newValue // 값만 백엔드 데이터로 업데이트
        };
      });
      setCardData(updatedCardData); // 업데이트된 데이터로 state 변경
    } catch (error) {
      console.error("통계 데이터 로드 에러:", error);
      // axios 에러 처리: error.response.status 등으로 상태 코드 접근 가능
      if (error.response) {
        console.error("응답 에러:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("요청 에러:", error.request);
      } else {
        console.error("알 수 없는 에러:", error.message);
      }
      setCardData([]);
    }
  }, [])

  const fetchStatusData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/analytics/status-count`);
      const backendData = response.data; // 백엔드에서 온 DTO 데이터

      // DTO 데이터를 받아서 기존 StatusData의 value만 업데이트!
      const updatedStatusData = statusDistributionData.map(stat => {
        let newValue = stat.value; // 기본값은 기존 value로
        let newCount = stat.count;

        if (stat.key && backendData.hasOwnProperty(stat.key)) { // stat.key가 있고, backendData에 해당 키가 존재하면
          newValue = backendData[stat.key]
          newCount = formatNumberWithCommas(backendData[stat.key])// 해당하는 값을 가져와서 포맷
        } else {
          // 만약 DTO에 해당 키가 없거나 데이터가 비어있으면 기본값 0 유지 (혹은 다른 기본값 설정)
          newValue = 0; // 명시적으로 0으로 설정
        }

        return {
          ...stat, // 기존 아이콘, 제목 등은 그대로 유지
          value: newValue, // 값만 백엔드 데이터로 업데이트
          count: newCount
        };
      });
      setStatusData(updatedStatusData); // 업데이트된 데이터로 state 변경
    } catch (error) {
      console.error("통계 데이터 로드 에러:", error);
      // axios 에러 처리: error.response.status 등으로 상태 코드 접근 가능
      if (error.response) {
        console.error("응답 에러:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("요청 에러:", error.request);
      } else {
        console.error("알 수 없는 에러:", error.message);
      }
      setStatusData([]);
    }
  }, [])

  const fetchCategoryAsCount = useCallback(async () => {
    try {
      const response = await axios.get(`/api/analytics/category-as-count`);
      const backendData = response.data;

      const updatedCategoryAsCountData = backendData.map(stat => ({
        product: stat.category,
        count: stat.count
      }));
      setCategoryAsCountData(updatedCategoryAsCountData);
    } catch (error) {
      console.error("카테고리별 A/S 건수 로드 에러:", error);
    }
  }, [])

  const fetchSalesTrendData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/analytics/revenue-trend?period=${period}`);
      const backendData = response.data;
      console.log("DTO data: ", response.data);

      const updatedSalesTrendData = backendData.map(stat => ({
        ...stat,
        revenue: Number(stat.revenue)
      }));
      console.log("updatedSalesTrendData: ", updatedSalesTrendData);
      setChartData(updatedSalesTrendData);
      console.log("chartData: ", chartData);
    } catch (error) {
      console.error("매출 추이 데이터 로드 에러:", error);
      // axios 에러 처리: error.response.status 등으로 상태 코드 접근 가능
      if (error.response) {
        console.error("응답 에러:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("요청 에러:", error.request);
      } else {
        console.error("알 수 없는 에러:", error.message);
      }
      setChartData([]);
    }
  }, [period]);

  useEffect(() => {
    fetchCardData(); // 컴포넌트 마운트 시 데이터 불러오기
  }, [fetchCardData]);

  useEffect(() => {
    fetchStatusData(); // 컴포넌트 마운트 시 데이터 불러오기
  }, [fetchStatusData]);

  useEffect(() => {
    fetchCategoryAsCount(); // 컴포넌트 마운트 시 데이터 불러오기
  }, [fetchCategoryAsCount]);
  

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
    return 'label';
  };
  // 차트 제목도 동적으로 변경
  const getChartTitle = () => {
    switch (period) {
      case 'daily': return '일별 매출 추이';
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

// // Modern Area Chart
//   const ModernAreaChart = ({ data, title, dataKeys }) => (
//       <Card className="p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900">{title}</h3>
//           <div className="flex gap-4">
//             {dataKeys.map((key, index) => (
//                 <div key={key.key} className="flex items-center gap-2">
//                   <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: key.color }} />
//                   <span className="text-sm font-medium text-gray-600">{key.name}</span>
//                 </div>
//             ))}
//           </div>
//         </div>
//         <ResponsiveContainer width="100%" height={300}>
//           <AreaChart data={data}>
//             <defs>
//               <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
//                 <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
//               </linearGradient>
//               <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
//                 <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//             <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
//             <YAxis stroke="#6B7280" fontSize={12} />
//             <Tooltip content={<CustomTooltip />} />
//             <Area
//                 type="monotone"
//                 dataKey="count"
//                 stroke="#3B82F6"
//                 strokeWidth={3}
//                 fillOpacity={1}
//                 fill="url(#colorCount)"
//             />
//             <Area
//                 type="monotone"
//                 dataKey="completed"
//                 stroke="#10B981"
//                 strokeWidth={3}
//                 fillOpacity={1}
//                 fill="url(#colorCompleted)"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </Card>
//   );

// Modern Bar Chart with Trends
const ModernBarChart = ({ data, title }) => {
  const maxCount = Math.max(...data.map(item => item.count)); // 최대값 찾기

  return (
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
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

  // StatisticsSection 컴포넌트
  const StatisticsSection = () => {
    return (
        <div className="space-y-8">
          {/* 핵심 지표 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cardData.map((stat, index) => {
              const IconComponent = stat.icon;
              if (!IconComponent) { // 만약을 대비해서 아이콘이 없는 경우 처리
                console.warn(`아이콘 컴포넌트가 없어! stat: ${stat.title}`);
                return null; // 렌더링 안 함
              }
              return (
                <Card key={index} hover className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                      <IconComponent className="w-6 h-6 text-white"/>
                    </div>
                    {/*<div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">*/}
                    {/*  <TrendingUp className="w-4 h-4" />*/}
                    {/*  {stat.change}*/}
                    {/*</div>*/}

                    <h3 className="text-xl font-bold text-gray-900 mb-2 pl-2">{stat.title}</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </Card>
              );
            })}
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
                data={statusData}
                title="처리 단계별 현황"
            />
            <ModernBarChart
                data={categoryAsCountData}
                title="제품별 A/S 건수 (TOP 6)"
            />
          </div>

          {/* 매출 트렌드 */}
          <Card className="p-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              {/* 차트 제목 */}
              <h3 className="text-xl font-bold text-gray-900">{getChartTitle()}</h3>

              {/* 기간 선택 드롭다운 */}
              <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel id="period-select-label">기간</InputLabel>
                <Select
                    labelId="period-select-label"
                    value={period}
                    onChange={handleChangePeriod}
                    label="기간"
                >
                  <MenuItem value="daily">일별</MenuItem>
                  <MenuItem value="monthly">월별</MenuItem>
                  <MenuItem value="yearly">년별</MenuItem>
                </Select>
              </FormControl>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}> {/* chartData로 변경 */}
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey={getXAxisDataKey()} stroke="#6B7280" fontSize={12} /> {/* dataKey 동적 변경! */}
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="revenue" // 'revenue' 필드는 모든 기간에서 동일하다고 가정! 
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