import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import styles from '../../css/Delivery/DeliveryAnalytics.module.css';

const DeliveryAnalytics = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('30days');


    useEffect(() => {
        // 실제 API 호출
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/delivery/analytics/dashboard', {
                    params: { timeframe: selectedTimeframe }
                });
                
                if (response.data.status === 200) {
                    setDashboardData(response.data.data);
                } else {
                    console.error('API 응답 오류:', response.data.message);
                    setDashboardData(null);
                }
            } catch (error) {
                console.error('대시보드 데이터 로딩 실패:', error);
                setDashboardData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedTimeframe]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>배송 분석 데이터를 불러오는 중...</p>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className={styles.errorContainer}>
                <AlertCircle size={48} />
                <p>데이터를 불러올 수 없습니다.</p>
            </div>
        );
    }

    // 차트 데이터 준비
    const carrierData = Object.entries(dashboardData.carrierStats.distribution).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / dashboardData.totalDeliveries) * 100).toFixed(1)
    }));

    const dailyData = Object.entries(dashboardData.dailyStats.dailyCounts).map(([date, count]) => ({
        date,
        count
    }));

    const regionData = Object.entries(dashboardData.regionStats).map(([region, count]) => ({
        region,
        count,
        value: count  // Bar chart에서 사용할 값
    }));
    
    // 디버깅용 로그
    console.log('regionData:', regionData);

    const statusData = [
        { 
            name: '배송완료', 
            value: dashboardData.deliveredCount, 
            color: '#10B981',
            percentage: ((dashboardData.deliveredCount / dashboardData.totalDeliveries) * 100).toFixed(1)
        },
        { 
            name: '배송중', 
            value: dashboardData.shippedCount, 
            color: '#3B82F6',
            percentage: ((dashboardData.shippedCount / dashboardData.totalDeliveries) * 100).toFixed(1)
        },
        { 
            name: '배송준비', 
            value: dashboardData.pendingCount, 
            color: '#F59E0B',
            percentage: ((dashboardData.pendingCount / dashboardData.totalDeliveries) * 100).toFixed(1)
        }
    ];

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>배송 분석 대시보드</h1>
                <div className={styles.timeframeSelector}>
                    <select 
                        value={selectedTimeframe} 
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className={styles.select}
                    >
                        <option value="7days">최근 7일</option>
                        <option value="30days">최근 30일</option>
                        <option value="90days">최근 90일</option>
                    </select>
                </div>
            </div>

            {/* 핵심 지표 카드 */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                        <Package size={24} />
                    </div>
                    <div className={styles.metricContent}>
                        <h3>총 배송건수</h3>
                        <p className={styles.metricValue}>{dashboardData.totalDeliveries.toLocaleString()}</p>
                        <span className={styles.metricSubtext}>최근 30일</span>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.metricContent}>
                        <h3>완료율</h3>
                        <p className={styles.metricValue}>{dashboardData.performanceMetrics.completionRate}%</p>
                        <span className={styles.metricSubtext}>배송 성공률</span>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.metricContent}>
                        <h3>평균 배송시간</h3>
                        <p className={styles.metricValue}>{dashboardData.performanceMetrics.averageDeliveryTime}일</p>
                        <span className={styles.metricSubtext}>전체 평균</span>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                        <Truck size={24} />
                    </div>
                    <div className={styles.metricContent}>
                        <h3>정시 배송률</h3>
                        <p className={styles.metricValue}>{dashboardData.performanceMetrics.onTimeDeliveryRate}%</p>
                        <span className={styles.metricSubtext}>3일 이내 배송</span>
                    </div>
                </div>
            </div>

            {/* 차트 그리드 */}
            <div className={styles.chartsGrid}>
                {/* 택배사별 배송 현황 */}
                <div className={styles.chartCard}>
                    <h3>택배사별 배송 현황</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={carrierData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [value + '건', '배송건수']} />
                            <Bar dataKey="value" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 배송 상태 분포 */}
                <div className={styles.chartCard}>
                    <h3>배송 상태 분포</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name} ${percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 일별 배송 추이 */}
                <div className={`${styles.chartCard} ${styles.fullWidth}`}>
                    <h3>일별 배송 추이</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value) => [value + '건', '배송건수']} />
                            <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 지역별 배송 현황 */}
                <div className={styles.chartCard}>
                    <h3>지역별 배송 현황</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={regionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="region" />
                            <YAxis />
                            <Tooltip 
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0];
                                        const percentage = ((data.value / dashboardData.totalDeliveries) * 100).toFixed(1);
                                        return (
                                            <div style={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '12px 16px',
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                            }}>
                                                <div style={{ marginBottom: '4px', fontWeight: '600', color: '#8B5CF6' }}>
                                                    📍 {label}
                                                </div>
                                                <div>배송건수: <span style={{ fontWeight: 'bold' }}>{data.value}건</span></div>
                                                <div>비율: <span style={{ fontWeight: 'bold' }}>{percentage}%</span></div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="value" fill="#8B5CF6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 성과 요약 */}
                <div className={styles.chartCard}>
                    <h3>성과 요약</h3>
                    <div className={styles.summaryStats}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>최고 성과 택배사</span>
                            <span className={styles.summaryValue}>{dashboardData.carrierStats.topCarrier}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>일평균 배송건수</span>
                            <span className={styles.summaryValue}>{dashboardData.dailyStats.averagePerDay}건</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>배송중 건수</span>
                            <span className={styles.summaryValue}>{dashboardData.shippedCount}건</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>대기중 건수</span>
                            <span className={styles.summaryValue}>{dashboardData.pendingCount}건</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 실시간 현황 패널 */}
            <div className={styles.realtimePanel}>
                <h3>실시간 배송 현황</h3>
                <div className={styles.realtimeStats}>
                    <div className={styles.realtimeItem}>
                        <TrendingUp size={16} />
                        <span>오늘 신규 배송: {dashboardData.recentDeliveries}건</span>
                    </div>
                    <div className={styles.realtimeItem}>
                        <Package size={16} />
                        <span>처리 대기: {dashboardData.pendingCount}건</span>
                    </div>
                    <div className={styles.realtimeItem}>
                        <Truck size={16} />
                        <span>배송중: {dashboardData.shippedCount}건</span>
                    </div>
                    <div className={styles.realtimeItem}>
                        <CheckCircle size={16} />
                        <span>완료: {dashboardData.deliveredCount}건</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryAnalytics;