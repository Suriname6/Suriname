import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import { LocalShipping, Warning, Assessment, TrendingUp } from '@mui/icons-material';
import PredictionService from '../../services/predictionService';
import styles from '../../css/Prediction/RepairTimePrediction.module.css';

const DeliveryRiskPrediction = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deliveryId: '',
    distance: '',
    carrierType: '',
    weatherCondition: '',
    trafficLevel: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);

  useEffect(() => {
    fetchRecentPredictions();
  }, []);

  const fetchRecentPredictions = async () => {
    try {
      const response = await PredictionService.getRecentPredictions();
      const deliveryRiskPredictions = (response.data || [])
        .filter(p => p.predictionType === 'DELIVERY_RISK')
        .slice(0, 5);
      setRecentPredictions(deliveryRiskPredictions);
    } catch (error) {
      console.error('최근 예측 조회 실패:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.deliveryId || !formData.distance || !formData.carrierType) {
      setError('필수 필드를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestData = {
        deliveryId: parseInt(formData.deliveryId),
        distance: parseFloat(formData.distance),
        carrierType: formData.carrierType,
        weatherCondition: formData.weatherCondition || 'CLEAR',
        trafficLevel: formData.trafficLevel || 'NORMAL'
      };

      const response = await PredictionService.predictDeliveryRisk(requestData);
      setPrediction(response.data);
      
      // 최근 예측 목록 새로고침
      await fetchRecentPredictions();
      
    } catch (error) {
      console.error('배송 지연 위험도 예측 실패:', error);
      setError(error.message || '예측 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      deliveryId: '',
      distance: '',
      carrierType: '',
      weatherCondition: '',
      trafficLevel: ''
    });
    setPrediction(null);
    setError(null);
  };

  const getRiskColor = (riskLevel) => {
    if (riskLevel === 'HIGH') return '#f44336';
    if (riskLevel === 'MEDIUM') return '#ff9800';
    return '#4caf50';
  };

  const getRiskLabel = (riskLevel) => {
    if (riskLevel === 'HIGH') return '높음';
    if (riskLevel === 'MEDIUM') return '보통';
    return '낮음';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>📦 배송 지연 위험도 예측</h1>
        <p className={styles.subtitle}>배송 조건을 분석하여 지연 위험도를 예측합니다</p>
      </div>

      <Grid container spacing={3}>
        {/* 예측 입력 폼 */}
        <Grid item xs={12} md={8}>
          <Card className={styles.formCard}>
            <CardContent>
              <Typography variant="h6" className={styles.formTitle}>
                <LocalShipping className={styles.formIcon} />
                배송 정보 입력
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="배송 ID"
                      type="number"
                      value={formData.deliveryId}
                      onChange={(e) => handleInputChange('deliveryId', e.target.value)}
                      placeholder="예: 1"
                      required
                      helperText="배송의 고유 ID를 입력하세요"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="배송 거리 (km)"
                      type="number"
                      value={formData.distance}
                      onChange={(e) => handleInputChange('distance', e.target.value)}
                      placeholder="예: 25.5"
                      required
                      helperText="배송지까지의 거리를 입력하세요"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>배송업체</InputLabel>
                      <Select
                        value={formData.carrierType}
                        label="배송업체"
                        onChange={(e) => handleInputChange('carrierType', e.target.value)}
                      >
                        <MenuItem value="CJ대한통운">CJ대한통운</MenuItem>
                        <MenuItem value="로젠택배">로젠택배</MenuItem>
                        <MenuItem value="한진택배">한진택배</MenuItem>
                        <MenuItem value="우체국택배">우체국택배</MenuItem>
                        <MenuItem value="기타">기타</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>날씨 조건</InputLabel>
                      <Select
                        value={formData.weatherCondition}
                        label="날씨 조건"
                        onChange={(e) => handleInputChange('weatherCondition', e.target.value)}
                      >
                        <MenuItem value="CLEAR">맑음</MenuItem>
                        <MenuItem value="CLOUDY">흐림</MenuItem>
                        <MenuItem value="RAIN">비</MenuItem>
                        <MenuItem value="SNOW">눈</MenuItem>
                        <MenuItem value="STORM">폭풍</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>교통 상황</InputLabel>
                      <Select
                        value={formData.trafficLevel}
                        label="교통 상황"
                        onChange={(e) => handleInputChange('trafficLevel', e.target.value)}
                      >
                        <MenuItem value="LIGHT">원활</MenuItem>
                        <MenuItem value="NORMAL">보통</MenuItem>
                        <MenuItem value="HEAVY">혼잡</MenuItem>
                        <MenuItem value="SEVERE">심각한 정체</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error">
                        {error}
                      </Alert>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Box className={styles.buttonGroup}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
                        className={styles.submitButton}
                      >
                        {loading ? '예측 중...' : '위험도 예측'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={handleReset}
                        disabled={loading}
                      >
                        초기화
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* 최근 예측 결과 */}
        <Grid item xs={12} md={4}>
          <Card className={styles.recentCard}>
            <CardContent>
              <Typography variant="h6" className={styles.recentTitle}>
                <Warning className={styles.recentIcon} />
                최근 예측 결과
              </Typography>
              
              <Box className={styles.recentList}>
                {recentPredictions.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" className={styles.noData}>
                    아직 예측 결과가 없습니다
                  </Typography>
                ) : (
                  recentPredictions.map((item, index) => (
                    <Box key={index} className={styles.recentItem}>
                      <Typography variant="body2" className={styles.recentDate}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body1" className={styles.recentValue}>
                        {item.predictionResults?.[0]?.predictedValue || 'LOW'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        신뢰도: {Math.round((item.predictionResults?.[0]?.confidenceScore || 0) * 100)}%
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 예측 결과 */}
        {prediction && (
          <Grid item xs={12}>
            <Card className={styles.resultCard}>
              <CardContent>
                <Typography variant="h6" className={styles.resultTitle}>
                  <TrendingUp className={styles.resultIcon} />
                  예측 결과
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box className={styles.resultMetric}>
                      <Typography 
                        variant="h3" 
                        style={{ color: getRiskColor(prediction.predictedValue) }}
                      >
                        {getRiskLabel(prediction.predictedValue)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        지연 위험도
                      </Typography>
                      <Chip 
                        label={prediction.predictedValue}
                        size="small"
                        style={{ 
                          backgroundColor: getRiskColor(prediction.predictedValue),
                          color: 'white'
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Box className={styles.resultMetric}>
                      <Typography variant="h3" className={styles.resultValue}>
                        {Math.round(prediction.confidence * 100)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        예측 신뢰도
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Box className={styles.resultMetric}>
                      <Typography variant="body1" className={styles.modelVersion}>
                        {prediction.modelVersion}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        사용 모델
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Weka Decision Tree
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Box className={styles.resultMetric}>
                      <Typography variant="body1">
                        {new Date(prediction.predictionTime).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        예측 시간
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box className={styles.explanationBox}>
                      <Typography variant="h6" gutterBottom>
                        예측 설명
                      </Typography>
                      <Typography variant="body1">
                        {prediction.explanation}
                      </Typography>
                      {prediction.recommendations && (
                        <>
                          <Typography variant="h6" gutterBottom style={{marginTop: '16px'}}>
                            개선 제안
                          </Typography>
                          <Typography variant="body1">
                            {prediction.recommendations}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default DeliveryRiskPrediction;