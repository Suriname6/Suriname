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
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { People, PersonAdd, Assessment, TrendingUp } from '@mui/icons-material';
import PredictionService from '../../services/predictionService';
import styles from '../../css/Prediction/RepairTimePrediction.module.css';

const CustomerRetentionPrediction = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    lastVisitDays: '',
    purchaseAmount: '',
    customerGrade: '',
    satisfactionScore: ''
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
      const retentionPredictions = (response.data || [])
        .filter(p => p.predictionType === 'CUSTOMER_RETENTION')
        .slice(0, 5);
      setRecentPredictions(retentionPredictions);
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
    if (!formData.customerId || !formData.lastVisitDays || !formData.purchaseAmount) {
      setError('필수 필드를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestData = {
        customerId: parseInt(formData.customerId),
        lastVisitDays: parseInt(formData.lastVisitDays),
        purchaseAmount: parseFloat(formData.purchaseAmount),
        customerGrade: formData.customerGrade || 'BRONZE',
        satisfactionScore: parseFloat(formData.satisfactionScore) || 3.5
      };

      const response = await PredictionService.predictCustomerRetention(requestData);
      setPrediction(response.data);
      
      // 최근 예측 목록 새로고침
      await fetchRecentPredictions();
      
    } catch (error) {
      console.error('고객 재방문 예측 실패:', error);
      setError(error.message || '예측 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      customerId: '',
      lastVisitDays: '',
      purchaseAmount: '',
      customerGrade: '',
      satisfactionScore: ''
    });
    setPrediction(null);
    setError(null);
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 0.7) return '#4caf50';
    if (probability >= 0.4) return '#ff9800';
    return '#f44336';
  };

  const getProbabilityLabel = (probability) => {
    if (probability >= 0.7) return '높음';
    if (probability >= 0.4) return '보통';
    return '낮음';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>👥 고객 재방문 예측</h1>
        <p className={styles.subtitle}>고객 데이터를 분석하여 재방문 확률을 예측합니다</p>
      </div>

      <Grid container spacing={3}>
        {/* 예측 입력 폼 */}
        <Grid item xs={12} md={8}>
          <Card className={styles.formCard}>
            <CardContent>
              <Typography variant="h6" className={styles.formTitle}>
                <People className={styles.formIcon} />
                고객 정보 입력
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="고객 ID"
                      type="number"
                      value={formData.customerId}
                      onChange={(e) => handleInputChange('customerId', e.target.value)}
                      placeholder="예: 1"
                      required
                      helperText="고객의 고유 ID를 입력하세요"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="마지막 방문일 (일 전)"
                      type="number"
                      value={formData.lastVisitDays}
                      onChange={(e) => handleInputChange('lastVisitDays', e.target.value)}
                      placeholder="예: 30"
                      required
                      helperText="마지막 방문일로부터 며칠 지났는지 입력"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="총 구매 금액 (원)"
                      type="number"
                      value={formData.purchaseAmount}
                      onChange={(e) => handleInputChange('purchaseAmount', e.target.value)}
                      placeholder="예: 500000"
                      required
                      helperText="지금까지 총 구매한 금액을 입력"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>고객 등급</InputLabel>
                      <Select
                        value={formData.customerGrade}
                        label="고객 등급"
                        onChange={(e) => handleInputChange('customerGrade', e.target.value)}
                      >
                        <MenuItem value="BRONZE">브론즈</MenuItem>
                        <MenuItem value="SILVER">실버</MenuItem>
                        <MenuItem value="GOLD">골드</MenuItem>
                        <MenuItem value="PLATINUM">플래티넘</MenuItem>
                        <MenuItem value="VIP">VIP</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="만족도 점수 (1-5)"
                      type="number"
                      value={formData.satisfactionScore}
                      onChange={(e) => handleInputChange('satisfactionScore', e.target.value)}
                      placeholder="예: 4.2"
                      inputProps={{ min: 1, max: 5, step: 0.1 }}
                      helperText="고객 만족도 점수 (1: 매우 불만족, 5: 매우 만족)"
                    />
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
                        {loading ? '예측 중...' : '재방문 예측'}
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
                <PersonAdd className={styles.recentIcon} />
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
                        {Math.round((item.predictionResults?.[0]?.predictedValue || 0) * 100)}%
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
                        style={{ color: getProbabilityColor(prediction.predictedValue) }}
                      >
                        {Math.round(prediction.predictedValue * 100)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        재방문 확률
                      </Typography>
                      <Chip 
                        label={getProbabilityLabel(prediction.predictedValue)}
                        size="small"
                        color={
                          prediction.predictedValue >= 0.7 ? 'success' :
                          prediction.predictedValue >= 0.4 ? 'warning' : 'error'
                        }
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
                        Weka Logistic Regression
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

                  {/* 추가 정보 */}
                  {prediction.nextVisitDate && (
                    <Grid item xs={12} md={6}>
                      <Box className={styles.resultMetric}>
                        <Typography variant="h6">
                          {new Date(prediction.nextVisitDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          예상 다음 방문일
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {prediction.clv && (
                    <Grid item xs={12} md={6}>
                      <Box className={styles.resultMetric}>
                        <Typography variant="h6">
                          ₩{prediction.clv?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          고객 생애 가치 (CLV)
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Box className={styles.explanationBox}>
                      <Typography variant="h6" gutterBottom>
                        예측 설명
                      </Typography>
                      <Typography variant="body1">
                        {prediction.explanation}
                      </Typography>
                      
                      {prediction.retentionStrategies && prediction.retentionStrategies.length > 0 && (
                        <>
                          <Typography variant="h6" gutterBottom style={{marginTop: '16px'}}>
                            권장 고객 유지 전략
                          </Typography>
                          <List dense>
                            {prediction.retentionStrategies.map((strategy, index) => (
                              <ListItem key={index}>
                                <ListItemText 
                                  primary={strategy}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
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

export default CustomerRetentionPrediction;