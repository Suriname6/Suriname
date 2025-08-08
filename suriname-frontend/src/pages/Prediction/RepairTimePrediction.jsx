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
import { Build, Schedule, Assessment, TrendingUp } from '@mui/icons-material';
import PredictionService from '../../services/predictionService';
import styles from '../../css/Prediction/RepairTimePrediction.module.css';

const RepairTimePrediction = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestId: '',
    productCategory: '',
    issueDescription: '',
    employeeExperience: '',
    currentWorkload: ''
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
      const repairTimePredictions = (response.data || [])
        .filter(p => p.predictionType === 'REPAIR_TIME')
        .slice(0, 5);
      setRecentPredictions(repairTimePredictions);
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
    if (!formData.requestId || !formData.productCategory || !formData.issueDescription) {
      setError('필수 필드를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestData = {
        requestId: parseInt(formData.requestId),
        productCategory: formData.productCategory,
        issueDescription: formData.issueDescription,
        employeeExperience: formData.employeeExperience || 'INTERMEDIATE',
        currentWorkload: parseInt(formData.currentWorkload) || 10
      };

      const response = await PredictionService.predictRepairTime(requestData);
      setPrediction(response.data);
      
      // 최근 예측 목록 새로고침
      await fetchRecentPredictions();
      
    } catch (error) {
      console.error('A/S 처리시간 예측 실패:', error);
      setError(error.message || '예측 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      requestId: '',
      productCategory: '',
      issueDescription: '',
      employeeExperience: '',
      currentWorkload: ''
    });
    setPrediction(null);
    setError(null);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4caf50';
    if (confidence >= 0.6) return '#ff9800';
    return '#f44336';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return '높음';
    if (confidence >= 0.6) return '보통';
    return '낮음';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🔧 A/S 처리시간 예측</h1>
        <p className={styles.subtitle}>AI 모델을 활용하여 A/S 처리 소요시간을 예측합니다</p>
      </div>

      <Grid container spacing={3}>
        {/* 예측 입력 폼 */}
        <Grid item xs={12} md={8}>
          <Card className={styles.formCard}>
            <CardContent>
              <Typography variant="h6" className={styles.formTitle}>
                <Build className={styles.formIcon} />
                예측 정보 입력
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="요청 ID"
                      type="number"
                      value={formData.requestId}
                      onChange={(e) => handleInputChange('requestId', e.target.value)}
                      placeholder="예: 1"
                      required
                      helperText="A/S 요청의 고유 ID를 입력하세요"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>제품 카테고리</InputLabel>
                      <Select
                        value={formData.productCategory}
                        label="제품 카테고리"
                        onChange={(e) => handleInputChange('productCategory', e.target.value)}
                      >
                        <MenuItem value="TV">TV</MenuItem>
                        <MenuItem value="냉장고">냉장고</MenuItem>
                        <MenuItem value="세탁기">세탁기</MenuItem>
                        <MenuItem value="에어컨">에어컨</MenuItem>
                        <MenuItem value="기타">기타</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="문제 설명"
                      multiline
                      rows={3}
                      value={formData.issueDescription}
                      onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                      placeholder="예: TV 화면이 깜빡이고 소리가 나지 않습니다"
                      required
                      helperText="문제 상황을 자세히 설명해주세요"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>담당자 경험도</InputLabel>
                      <Select
                        value={formData.employeeExperience}
                        label="담당자 경험도"
                        onChange={(e) => handleInputChange('employeeExperience', e.target.value)}
                      >
                        <MenuItem value="BEGINNER">초급</MenuItem>
                        <MenuItem value="INTERMEDIATE">중급</MenuItem>
                        <MenuItem value="EXPERT">전문가</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="현재 업무량"
                      type="number"
                      value={formData.currentWorkload}
                      onChange={(e) => handleInputChange('currentWorkload', e.target.value)}
                      placeholder="10"
                      helperText="현재 처리 중인 A/S 건수"
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
                        {loading ? '예측 중...' : '처리시간 예측'}
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
                <Schedule className={styles.recentIcon} />
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
                        {item.predictionResults?.[0]?.predictedValue || 0}일
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
                      <Typography variant="h3" className={styles.resultValue}>
                        {Math.round(prediction.predictedValue * 10) / 10}일
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        예상 처리시간
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Box className={styles.resultMetric}>
                      <Typography 
                        variant="h3" 
                        style={{ color: getConfidenceColor(prediction.confidence) }}
                      >
                        {Math.round(prediction.confidence * 100)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        예측 신뢰도
                      </Typography>
                      <Chip 
                        label={getConfidenceLabel(prediction.confidence)}
                        size="small"
                        color={
                          prediction.confidence >= 0.8 ? 'success' :
                          prediction.confidence >= 0.6 ? 'warning' : 'error'
                        }
                      />
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
                        Weka Random Forest
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

export default RepairTimePrediction;