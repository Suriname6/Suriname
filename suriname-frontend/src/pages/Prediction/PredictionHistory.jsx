import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Pagination,
  Chip,
  IconButton
} from '@mui/material';
import { Search, Refresh, FilterList } from '@mui/icons-material';
import PredictionService from '../../services/predictionService';
import styles from '../../css/Prediction/PredictionHistory.module.css';

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    page: 0,
    size: 20
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchPredictions();
  }, [filters.type, filters.page]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const response = await PredictionService.getPredictionHistory(
        filters.type, filters.page, filters.size
      );
      
      setPredictions(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error('예측 이력 로드 실패:', error);
      alert('데이터를 불러오는데 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 0 : value
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 0 }));
    fetchPredictions();
  };

  const handleRefresh = () => {
    fetchPredictions();
  };

  const getPredictionTypeLabel = (type) => {
    switch (type) {
      case 'REPAIR_TIME':
        return 'A/S 처리시간';
      case 'DELIVERY_RISK':
        return '배송 지연';
      case 'CUSTOMER_RETENTION':
        return '고객 재방문';
      default:
        return type;
    }
  };

  const getPredictionTypeColor = (type) => {
    switch (type) {
      case 'REPAIR_TIME':
        return 'primary';
      case 'DELIVERY_RISK':
        return 'warning';
      case 'CUSTOMER_RETENTION':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPredictionValue = (type, value) => {
    if (!value) return '-';
    
    switch (type) {
      case 'REPAIR_TIME':
        return `${value}일`;
      case 'DELIVERY_RISK':
        return `${Math.round(value * 100)}%`;
      case 'CUSTOMER_RETENTION':
        return `${Math.round(value * 100)}%`;
      default:
        return value.toString();
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>예측 이력을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>📊 예측 결과 이력</h1>
        <p className={styles.subtitle}>
          전체 {totalElements}건의 예측 결과를 관리할 수 있습니다
        </p>
      </div>

      {/* 필터 및 검색 */}
      <Card className={styles.filterCard}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>예측 유형</InputLabel>
                <Select
                  value={filters.type}
                  label="예측 유형"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="REPAIR_TIME">A/S 처리시간</MenuItem>
                  <MenuItem value="DELIVERY_RISK">배송 지연</MenuItem>
                  <MenuItem value="CUSTOMER_RETENTION">고객 재방문</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="검색"
                placeholder="고객명, 요청번호로 검색..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <IconButton 
                onClick={handleSearch} 
                className={styles.searchButton}
                title="검색"
              >
                <Search />
              </IconButton>
              <IconButton 
                onClick={handleRefresh} 
                className={styles.refreshButton}
                title="새로고침"
              >
                <Refresh />
              </IconButton>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box className={styles.summaryInfo}>
                <Typography variant="body2" color="textSecondary">
                  페이지: {filters.page + 1} / {totalPages || 1}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 예측 이력 목록 */}
      <Grid container spacing={2}>
        {predictions.length === 0 ? (
          <Grid item xs={12}>
            <Card className={styles.emptyCard}>
              <CardContent>
                <Typography variant="h6" align="center" color="textSecondary">
                  조건에 맞는 예측 결과가 없습니다
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          predictions.map((prediction, index) => (
            <Grid item xs={12} key={prediction.predictionId || index}>
              <Card className={styles.predictionCard}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    {/* 예측 유형 */}
                    <Grid item xs={12} md={2}>
                      <Chip
                        label={getPredictionTypeLabel(prediction.predictionType)}
                        color={getPredictionTypeColor(prediction.predictionType)}
                        variant="filled"
                        size="small"
                      />
                    </Grid>

                    {/* 고객 정보 */}
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="textSecondary">
                        고객명
                      </Typography>
                      <Typography variant="body1">
                        {prediction.customer?.name || '-'}
                      </Typography>
                    </Grid>

                    {/* 예측값 */}
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="textSecondary">
                        예측 결과
                      </Typography>
                      <Typography variant="h6" className={styles.predictionValue}>
                        {prediction.predictionResults?.[0] ? 
                          formatPredictionValue(
                            prediction.predictionType, 
                            prediction.predictionResults[0].predictedValue
                          ) : '-'
                        }
                      </Typography>
                    </Grid>

                    {/* 신뢰도 */}
                    <Grid item xs={12} md={1.5}>
                      <Typography variant="body2" color="textSecondary">
                        신뢰도
                      </Typography>
                      <Typography variant="body1">
                        {prediction.predictionResults?.[0]?.confidenceScore ? 
                          `${Math.round(prediction.predictionResults[0].confidenceScore * 100)}%` 
                          : '-'
                        }
                      </Typography>
                    </Grid>

                    {/* 모델 버전 */}
                    <Grid item xs={12} md={1.5}>
                      <Typography variant="body2" color="textSecondary">
                        모델
                      </Typography>
                      <Typography variant="caption" className={styles.modelVersion}>
                        {prediction.predictionResults?.[0]?.modelVersion || '-'}
                      </Typography>
                    </Grid>

                    {/* 생성 시간 */}
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="textSecondary">
                        예측 시간
                      </Typography>
                      <Typography variant="body2">
                        {formatDateTime(prediction.createdAt)}
                      </Typography>
                    </Grid>

                    {/* 담당자 */}
                    <Grid item xs={12} md={1}>
                      <Typography variant="body2" color="textSecondary">
                        담당자
                      </Typography>
                      <Typography variant="body2">
                        {prediction.createdBy?.name || '-'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* 입력 데이터 (접을 수 있는 영역) */}
                  {prediction.inputData && (
                    <Box className={styles.inputDataSection}>
                      <Typography variant="caption" color="textSecondary">
                        입력 데이터: {prediction.inputData}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Box className={styles.paginationContainer}>
          <Pagination
            count={totalPages}
            page={filters.page + 1}
            onChange={(event, page) => handleFilterChange('page', page - 1)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </div>
  );
};

export default PredictionHistory;