import axiosInstance from '../api/axiosInstance';

/**
 * 예측 분석 API 서비스
 */
class PredictionService {
  // API 기본 경로
  static BASE_URL = '/api/predictions';

  /**
   * A/S 처리시간 예측
   */
  static async predictRepairTime(requestData) {
    try {
      const response = await axiosInstance.post(`${this.BASE_URL}/repair-time`, requestData);
      return response.data;
    } catch (error) {
      console.error('A/S 처리시간 예측 실패:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 배송 지연 위험도 예측
   */
  static async predictDeliveryRisk(requestData) {
    try {
      const response = await axiosInstance.post(`${this.BASE_URL}/delivery-risk`, requestData);
      return response.data;
    } catch (error) {
      console.error('배송 지연 위험도 예측 실패:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 고객 재방문 예측
   */
  static async predictCustomerRetention(requestData) {
    try {
      const response = await axiosInstance.post(`${this.BASE_URL}/customer-retention`, requestData);
      return response.data;
    } catch (error) {
      console.error('고객 재방문 예측 실패:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 예측 이력 조회
   */
  static async getPredictionHistory(type = null, page = 0, size = 20) {
    try {
      const params = { page, size };
      if (type) params.type = type;

      const response = await axiosInstance.get(`${this.BASE_URL}/history`, { params });
      return response.data;
    } catch (error) {
      console.error('예측 이력 조회 실패:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 모델 성능 통계 조회
   */
  static async getModelPerformance() {
    try {
      const response = await axiosInstance.get(`${this.BASE_URL}/performance`);
      return response.data;
    } catch (error) {
      console.error('모델 성능 통계 조회 실패:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 최근 예측 결과 조회
   */
  static async getRecentPredictions() {
    try {
      const response = await axiosInstance.get(`${this.BASE_URL}/recent`);
      return response.data;
    } catch (error) {
      console.error('최근 예측 결과 조회 실패:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 예측 통계 대시보드 조회
   */
  static async getPredictionStatistics() {
    try {
      const response = await axiosInstance.get(`${this.BASE_URL}/statistics`);
      return response.data;
    } catch (error) {
      console.error('예측 통계 조회 실패:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 대시보드 통합 데이터 조회 (병렬 처리)
   */
  static async getDashboardData() {
    try {
      const [statistics, performance, recent] = await Promise.all([
        this.getPredictionStatistics(),
        this.getModelPerformance(),
        this.getRecentPredictions()
      ]);

      return {
        statistics: statistics.data,
        performance: performance.data,
        recent: recent.data
      };
    } catch (error) {
      console.error('대시보드 데이터 조회 실패:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 에러 처리 헬퍼
   */
  static handleError(error) {
    if (error.response) {
      // 서버 응답 에러
      const { status, data } = error.response;
      return new Error(data.message || `서버 오류 (${status})`);
    } else if (error.request) {
      // 네트워크 에러
      return new Error('네트워크 연결을 확인해주세요.');
    } else {
      // 기타 에러
      return new Error(error.message || '알 수 없는 오류가 발생했습니다.');
    }
  }
}

export default PredictionService;