import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box,
  Tabs,
  Tab,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, Speed, Assessment, Timeline } from '@mui/icons-material';
import PredictionService from '../../services/predictionService';
import styles from '../../css/Prediction/PredictionPerformance.module.css';

const PredictionPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState({});
  const [statistics, setStatistics] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      const [performanceResponse, statisticsResponse] = await Promise.all([
        PredictionService.getModelPerformance(),
        PredictionService.getPredictionStatistics()
      ]);
      
      setPerformance(performanceResponse.data);
      setStatistics(statisticsResponse.data);
    } catch (error) {
      console.error('성능 데이터 로드 실패:', error);
      alert('데이터를 불러오는데 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 모델별 성능 데이터
  const modelPerformanceData = [
    {
      name: 'A/S 처리시간',
      accuracy: (performance.repairTimeAccuracy * 100) || 0,
      predictions: statistics.repair_time || 0,
      model: 'Random Forest',
      version: 'v2.0'
    },
    {
      name: '배송 지연',
      accuracy: (performance.deliveryRiskAccuracy * 100) || 0,
      predictions: statistics.delivery_risk || 0,
      model: 'Linear Regression',
      version: 'v1.0'
    },
    {
      name: '고객 재방문',
      accuracy: (performance.customerRetentionAccuracy * 100) || 0,
      predictions: statistics.customer_retention || 0,
      model: 'Random Forest',
      version: 'v1.0'
    }
  ];

  // 시간별 성능 추이 (시뮬레이션 데이터)
  const performanceTrendData = [
    { date: '2024-08-01', repairTime: 85, delivery: 78, retention: 82 },
    { date: '2024-08-02', repairTime: 87, delivery: 80, retention: 84 },
    { date: '2024-08-03', repairTime: 86, delivery: 79, retention: 83 },
    { date: '2024-08-04', repairTime: 88, delivery: 81, retention: 85 },
    { date: '2024-08-05', repairTime: 89, delivery: 82, retention: 86 },
    { date: '2024-08-06', repairTime: 87, delivery: 83, retention: 87 },
    { date: '2024-08-07', repairTime: 90, delivery: 84, retention: 88 }
  ];

  // 에러 분석 데이터 (시뮬레이션)
  const errorAnalysisData = [
    { name: '데이터 불완전', value: 35, color: '#ff6b6b' },
    { name: '모델 한계', value: 25, color: '#feca57' },
    { name: '외부 요인', value: 20, color: '#48dbfb' },
    { name: '시스템 오류', value: 12, color: '#ff9ff3' },
    { name: '기타', value: 8, color: '#54a0ff' }
  ];

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 85) return '#4caf50';
    if (accuracy >= 70) return '#ff9800';
    return '#f44336';
  };

  const getAccuracyStatus = (accuracy) => {
    if (accuracy >= 85) return 'EXCELLENT';
    if (accuracy >= 70) return 'GOOD';
    return 'NEEDS_IMPROVEMENT';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>성능 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚡ 모델 성능 관리</h1>
        <p className={styles.subtitle}>ML 모델의 성능 지표와 분석 결과를 관리합니다</p>
      </div>

      {/* 성능 요약 카드들 */}
      <Grid container spacing={3} className={styles.summarySection}>
        <Grid item xs={12} md={3}>
          <Card className={styles.summaryCard}>
            <CardContent>
              <Box className={styles.summaryHeader}>
                <Assessment className={styles.summaryIcon} />
                <Typography variant="h6">전체 예측 건수</Typography>
              </Box>
              <Typography variant="h3" className={styles.summaryNumber}>
                {performance.totalPredictions || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                누적 처리 건수
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card className={styles.summaryCard}>
            <CardContent>
              <Box className={styles.summaryHeader}>
                <Speed className={styles.summaryIcon} />
                <Typography variant="h6">평균 정확도</Typography>
              </Box>
              <Typography variant="h3" className={styles.summaryNumber}>
                {Math.round((
                  (performance.repairTimeAccuracy + 
                   performance.deliveryRiskAccuracy + 
                   performance.customerRetentionAccuracy) / 3
                ) * 100) || 0}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                전체 모델 평균
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card className={styles.summaryCard}>
            <CardContent>
              <Box className={styles.summaryHeader}>
                <TrendingUp className={styles.summaryIcon} />
                <Typography variant="h6">최고 성능 모델</Typography>
              </Box>
              <Typography variant="h3" className={styles.summaryNumber}>
                A/S
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {Math.round((performance.repairTimeAccuracy * 100) || 0)}% 정확도
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card className={styles.summaryCard}>
            <CardContent>
              <Box className={styles.summaryHeader}>
                <Timeline className={styles.summaryIcon} />
                <Typography variant="h6">업데이트</Typography>
              </Box>
              <Typography variant="body1" className={styles.summaryNumber}>
                실시간
              </Typography>
              <Typography variant="body2" color="textSecondary">
                자동 모니터링 중
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 탭 네비게이션 */}
      <Card className={styles.tabContainer}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="모델별 성능" />
          <Tab label="성능 추이" />
          <Tab label="에러 분석" />
          <Tab label="상세 지표" />
        </Tabs>
      </Card>

      {/* 탭 콘텐츠 */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* 모델별 성능 카드 */}
          {modelPerformanceData.map((model, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card className={styles.modelCard}>
                <CardContent>
                  <Typography variant="h6" className={styles.modelName}>
                    {model.name}
                  </Typography>
                  
                  <Box className={styles.accuracySection}>
                    <Typography variant="h4" 
                      style={{ color: getAccuracyColor(model.accuracy) }}>
                      {Math.round(model.accuracy)}%
                    </Typography>
                    <Chip 
                      label={getAccuracyStatus(model.accuracy)}
                      size="small"
                      color={model.accuracy >= 85 ? 'success' : 
                             model.accuracy >= 70 ? 'warning' : 'error'}
                    />
                  </Box>

                  <LinearProgress 
                    variant="determinate" 
                    value={model.accuracy} 
                    className={styles.progressBar}
                    sx={{
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getAccuracyColor(model.accuracy)
                      }
                    }}
                  />

                  <Box className={styles.modelDetails}>
                    <Typography variant="body2" color="textSecondary">
                      예측 건수: {model.predictions}건
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      모델: {model.model} {model.version}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* 성능 비교 차트 */}
          <Grid item xs={12}>
            <Card className={styles.chartCard}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  모델별 성능 비교
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={modelPerformanceData}>
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
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card className={styles.chartCard}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  모델 성능 추이 (최근 7일)
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={performanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, '정확도']} />
                    <Area type="monotone" dataKey="repairTime" stackId="1" 
                          stroke="#2196f3" fill="#2196f3" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="delivery" stackId="2" 
                          stroke="#ff9800" fill="#ff9800" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="retention" stackId="3" 
                          stroke="#4caf50" fill="#4caf50" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className={styles.chartCard}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  예측 오류 원인 분석
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={errorAnalysisData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {errorAnalysisData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className={styles.chartCard}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  오류 개선 방안
                </Typography>
                <Box className={styles.improvementList}>
                  <Box className={styles.improvementItem}>
                    <Typography variant="subtitle2">1. 데이터 품질 향상</Typography>
                    <Typography variant="body2" color="textSecondary">
                      입력 데이터의 완성도와 정확성을 높여 예측 성능을 개선합니다.
                    </Typography>
                  </Box>
                  <Box className={styles.improvementItem}>
                    <Typography variant="subtitle2">2. 모델 재훈련</Typography>
                    <Typography variant="body2" color="textSecondary">
                      새로운 데이터로 정기적인 모델 재훈련을 실시합니다.
                    </Typography>
                  </Box>
                  <Box className={styles.improvementItem}>
                    <Typography variant="subtitle2">3. 외부 데이터 연동</Typography>
                    <Typography variant="body2" color="textSecondary">
                      날씨, 교통 등 외부 요인을 고려한 예측 모델로 발전시킵니다.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card className={styles.metricsCard}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  상세 성능 지표
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box className={styles.metricBox}>
                      <Typography variant="h4" color="primary">
                        {Math.round((performance.repairTimeAccuracy * 100) || 0)}%
                      </Typography>
                      <Typography variant="body1">A/S 처리시간 정확도</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Random Forest 모델 (Weka v3.8)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box className={styles.metricBox}>
                      <Typography variant="h4" color="warning.main">
                        {Math.round((performance.deliveryRiskAccuracy * 100) || 0)}%
                      </Typography>
                      <Typography variant="body1">배송 지연 예측 정확도</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Linear Regression 모델 (Weka v3.8)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box className={styles.metricBox}>
                      <Typography variant="h4" color="success.main">
                        {Math.round((performance.customerRetentionAccuracy * 100) || 0)}%
                      </Typography>
                      <Typography variant="body1">고객 재방문 예측 정확도</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Random Forest 모델 (Weka v3.8)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default PredictionPerformance;