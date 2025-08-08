import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import PredictionService from '../../services/predictionService';
import styles from '../../css/Prediction/PredictionDashboard.module.css';

const PredictionDashboard = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({});
  const [performance, setPerformance] = useState({});
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // 실시간 데이터 갱신 (30초마다)
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const dashboardData = await PredictionService.getDashboardData();
      
      setStatistics(dashboardData.statistics);
      setPerformance(dashboardData.performance);
      setRecentPredictions(dashboardData.recent);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      alert('데이터를 불러오는데 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const performanceData = [
    { name: 'A/S 처리시간', accuracy: performance.repairTimeAccuracy * 100 || 0, color: '#2196f3' },
    { name: '배송 지연', accuracy: performance.deliveryRiskAccuracy * 100 || 0, color: '#ff9800' },
    { name: '고객 재방문', accuracy: performance.customerRetentionAccuracy * 100 || 0, color: '#4caf50' }
  ];

  // 예측 유형별 분포 데이터
  const distributionData = [
    { name: 'A/S 처리시간', value: statistics.repair_time || 0, color: '#2196f3' },
    { name: '배송 지연', value: statistics.delivery_risk || 0, color: '#ff9800' },
    { name: '고객 재방문', value: statistics.customer_retention || 0, color: '#4caf50' }
  ];

  // 시간대별 활동 데이터 (시뮬레이션)
  const activityData = [
    { time: '09:00', predictions: 12 },
    { time: '10:00', predictions: 18 },
    { time: '11:00', predictions: 25 },
    { time: '12:00', predictions: 15 },
    { time: '13:00', predictions: 20 },
    { time: '14:00', predictions: 30 },
    { time: '15:00', predictions: 28 },
    { time: '16:00', predictions: 22 },
    { time: '17:00', predictions: 16 }
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🔮 예측 분석 대시보드</h1>
        <p className={styles.subtitle}>AI 기반 비즈니스 인사이트와 예측 결과를 확인하세요</p>
      </div>

      <Grid container spacing={3}>
        {/* 통계 카드들 */}
        <Grid item xs={12} md={4}>
          <Card className={styles.statCard}>
            <CardContent>
              <Typography variant="h6" component="h2">
                총 예측 건수
              </Typography>
              <Typography variant="h4" className={styles.statNumber}>
                {performance.totalPredictions || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                전체 누적 예측
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={styles.statCard}>
            <CardContent>
              <Typography variant="h6" component="h2">
                A/S 처리시간 예측
              </Typography>
              <Typography variant="h4" className={styles.statNumber}>
                {statistics.repair_time || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                이번 달 예측 건수
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={styles.statCard}>
            <CardContent>
              <Typography variant="h6" component="h2">
                평균 정확도
              </Typography>
              <Typography variant="h4" className={styles.statNumber}>
                {Math.round((performance.repairTimeAccuracy * 100) || 0)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                A/S 예측 정확도
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 모델 성능 차트 */}
        <Grid item xs={12} md={6}>
          <Card className={styles.chartCard}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                모델 성능 현황
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '정확도']} />
                  <Bar dataKey="accuracy" fill="#3f51b5" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 예측 유형별 분포 */}
        <Grid item xs={12} md={6}>
          <Card className={styles.chartCard}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                예측 유형별 분포
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 시간대별 활동 */}
        <Grid item xs={12} md={8}>
          <Card className={styles.chartCard}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                오늘의 예측 활동
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}건`, '예측 수행']} />
                  <Area type="monotone" dataKey="predictions" stroke="#3f51b5" fill="#3f51b5" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 최근 예측 결과 */}
        <Grid item xs={12} md={4}>
          <Card className={styles.recentCard}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                최근 예측 결과
              </Typography>
              <Box className={styles.recentList}>
                {recentPredictions.slice(0, 5).map((prediction, index) => (
                  <div key={index} className={styles.recentItem}>
                    <div className={styles.recentType}>
                      {prediction.predictionType === 'REPAIR_TIME' ? '🔧 A/S 처리시간' :
                       prediction.predictionType === 'DELIVERY_RISK' ? '📦 배송 위험도' :
                       '👥 고객 재방문'}
                    </div>
                    <div className={styles.recentTime}>
                      {new Date(prediction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {recentPredictions.length === 0 && (
                  <div className={styles.noData}>
                    아직 예측 데이터가 없습니다
                  </div>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 빠른 실행 버튼들 */}
        <Grid item xs={12}>
          <Card className={styles.actionCard}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                빠른 실행
              </Typography>
              <Box className={styles.actionButtons}>
                <button 
                  className={styles.actionButton}
                  onClick={() => navigate('/predictions/repair-time')}
                >
                  🔧 A/S 처리시간 예측
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => navigate('/predictions/delivery-risk')}
                >
                  📦 배송 지연 예측
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => navigate('/predictions/customer-retention')}
                >
                  👥 고객 재방문 예측
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => navigate('/predictions/performance')}
                >
                  📊 성능 관리
                </button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default PredictionDashboard;