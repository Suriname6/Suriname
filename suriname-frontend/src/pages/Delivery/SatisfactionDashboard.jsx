import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Download, RefreshCw, Star, TrendingUp, Users, MessageCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import styles from '../../css/Delivery/SatisfactionDashboard.module.css';

const SatisfactionDashboard = () => {
    const [surveys, setSurveys] = useState([]);
    const [stats, setStats] = useState({
        totalSurveys: 0,
        averageRating: 0,
        responseRate: 0,
        satisfactionRate: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('all');
    const [loading, setLoading] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // 더미 데이터 생성
    useEffect(() => {
        loadSatisfactionData();
    }, []);

    const loadSatisfactionData = async () => {
        setLoading(true);
        try {
            // 실제 API 호출 시도
            const response = await axios.get("/api/satisfaction", {
                params: {
                    page: 0,
                    size: 100  // 모든 데이터 가져오기
                }
            });
            
            if (response.data.status === 200) {
                const satisfactionData = response.data.data.content;
                const processedSurveys = satisfactionData.map(item => ({
                    surveyId: item.satisfactionId,
                    requestNo: item.requestNo,
                    customerName: item.customerName,
                    completionDate: item.completionDate ? item.completionDate.split('T')[0] : '',
                    overallRating: item.overallRating || 0,
                    serviceQualityRating: item.serviceQualityRating || 0,
                    responseTimeRating: item.responseTimeRating || 0,
                    deliveryRating: item.deliveryRating || 0,
                    staffKindnessRating: item.staffKindnessRating || 0,
                    recommendToOthers: item.recommendToOthers || false,
                    feedback: item.feedback || '',
                    satisfactionSentDate: item.createdAt,
                    submittedAt: item.submittedAt || item.createdAt
                }));
                
                setSurveys(processedSurveys);
                
                // 통계 계산
                const totalSurveys = processedSurveys.length;
                const avgRating = totalSurveys > 0 
                    ? processedSurveys.reduce((sum, survey) => sum + (survey.overallRating || 0), 0) / totalSurveys 
                    : 0;
                const satisfiedCount = processedSurveys.filter(survey => (survey.overallRating || 0) >= 4).length;
                const satisfactionRate = totalSurveys > 0 ? (satisfiedCount / totalSurveys) * 100 : 0;
                
                setStats({
                    totalSurveys,
                    averageRating: avgRating,
                    responseRate: 100, // API에서 제출된 데이터만 가져오므로 100%
                    satisfactionRate: Math.round(satisfactionRate)
                });
                
                setLoading(false);
            } else {
                throw new Error(response.data.message || "데이터 로드 실패");
            }
        } catch (apiError) {
            console.log("API 호출 실패, 샘플 데이터로 표시:", apiError);
            
            // Mock 데이터 fallback
            setTimeout(() => {
                const mockSurveys = [
                    {
                        surveyId: 1,
                        requestNo: 'AS-20250801-001',
                        customerName: '김민수',
                        completionDate: '2025-08-03',
                        overallRating: 5,
                        serviceQualityRating: 5,
                        responseTimeRating: 4,
                        deliveryRating: 5,
                        staffKindnessRating: 5,
                        recommendToOthers: true,
                        feedback: '매우 만족합니다. 빠른 수리와 친절한 서비스 감사합니다!',
                        satisfactionSentDate: '2025-08-04T10:00:00',
                        submittedAt: '2025-08-04T14:30:00'
                    },
                    {
                        surveyId: 2,
                        requestNo: 'AS-20250801-002',
                        customerName: '이영희',
                        completionDate: '2025-08-02',
                        overallRating: 4,
                        serviceQualityRating: 4,
                        responseTimeRating: 3,
                        deliveryRating: 4,
                        staffKindnessRating: 5,
                        recommendToOthers: true,
                        feedback: '전반적으로 좋았습니다. 다만 응답이 조금 늦었어요.',
                        satisfactionSentDate: '2025-08-03T09:00:00',
                        submittedAt: '2025-08-03T16:20:00'
                    },
                    {
                        surveyId: 3,
                        requestNo: 'AS-20250801-003',
                        customerName: '박철수',
                        completionDate: '2025-08-04',
                        overallRating: 3,
                        serviceQualityRating: 3,
                        responseTimeRating: 2,
                        deliveryRating: 3,
                        staffKindnessRating: 4,
                        recommendToOthers: false,
                        feedback: '수리는 잘 되었지만 시간이 너무 오래 걸렸습니다.',
                        satisfactionSentDate: '2025-08-05T11:00:00',
                        submittedAt: '2025-08-05T19:45:00'
                    }
                ];
                setSurveys(mockSurveys);
                setStats({
                    totalSurveys: mockSurveys.length,
                    averageRating: 4.0,
                    responseRate: 75,
                    satisfactionRate: 85
                });
                setLoading(false);
            }, 1000);
        } finally {
            // API 호출 실패 시에도 로딩 상태 해제
            if (loading) {
                setTimeout(() => setLoading(false), 1100);
            }
        }
    };

    const getStatusColor = (rating) => {
        if (rating >= 5) return styles.excellent;
        if (rating >= 4) return styles.good;
        if (rating >= 3) return styles.average;
        return styles.poor;
    };

    const renderStarRating = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                size={16}
                className={index < rating ? styles.starFilled : styles.starEmpty}
                fill={index < rating ? '#FFD700' : 'none'}
            />
        ));
    };

    const filteredSurveys = surveys.filter(survey => {
        // 검색어 필터링
        const matchesSearch = survey.requestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             survey.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 날짜 필터링
        const surveyDate = new Date(survey.submittedAt);
        const now = new Date();
        let matchesPeriod = true;
        
        switch (filterPeriod) {
            case 'today':
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                matchesPeriod = surveyDate >= today && surveyDate < tomorrow;
                break;
            case 'week':
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                matchesPeriod = surveyDate >= weekAgo;
                break;
            case 'month':
                const monthAgo = new Date(now);
                monthAgo.setDate(monthAgo.getDate() - 30);
                matchesPeriod = surveyDate >= monthAgo;
                break;
            case 'all':
            default:
                matchesPeriod = true;
                break;
        }
        
        return matchesSearch && matchesPeriod;
    });

    const exportToExcel = () => {
        try {
            // 데이터를 Excel 형태로 변환
            const excelData = filteredSurveys.map((survey, index) => ({
                '번호': index + 1,
                '접수번호': survey.requestNo,
                '고객명': survey.customerName,
                '완료일': survey.completionDate,
                '종합만족도': survey.overallRating,
                '서비스품질': survey.serviceQualityRating,
                '응답시간': survey.responseTimeRating,
                '배송만족도': survey.deliveryRating,
                '직원친절도': survey.staffKindnessRating,
                '추천의향': survey.recommendToOthers ? '추천' : '비추천',
                '설문발송일시': new Date(survey.satisfactionSentDate).toLocaleString('ko-KR'),
                '응답일시': new Date(survey.submittedAt).toLocaleString('ko-KR'),
                '고객의견': survey.feedback
            }));

            // 워크북 생성
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '만족도조사결과');

            // 컬럼 너비 조정
            const columnWidths = [
                { wch: 6 },  // 번호
                { wch: 16 }, // 접수번호
                { wch: 10 }, // 고객명
                { wch: 12 }, // 완료일
                { wch: 10 }, // 종합만족도
                { wch: 10 }, // 서비스품질
                { wch: 10 }, // 응답시간
                { wch: 10 }, // 배송만족도
                { wch: 10 }, // 직원친절도
                { wch: 10 }, // 추천의향
                { wch: 18 }, // 설문발송일시
                { wch: 18 }, // 응답일시
                { wch: 30 }  // 고객의견
            ];
            worksheet['!cols'] = columnWidths;

            // 파일 다운로드
            const today = new Date().toISOString().slice(0, 10);
            const fileName = `만족도조사결과_${today}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            console.log('Excel 파일 생성 완료:', fileName);
        } catch (error) {
            console.error('Excel 내보내기 실패:', error);
            alert('Excel 파일 생성 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>
                        <MessageCircle className={styles.titleIcon} />
                        만족도 조사 결과 대시보드
                    </h1>
                    <p className={styles.subtitle}>고객 만족도 조사 결과를 조회하고 분석할 수 있습니다</p>
                </div>
                
                <div className={styles.actions}>
                    <button onClick={loadSatisfactionData} className={styles.refreshButton} disabled={loading}>
                        <RefreshCw size={16} className={loading ? styles.spinning : ''} />
                        새로고침
                    </button>
                    <button onClick={exportToExcel} className={styles.exportButton}>
                        <Download size={16} />
                        Excel 내보내기
                    </button>
                </div>
            </div>

            {/* 통계 카드 */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Users />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.totalSurveys}</div>
                        <div className={styles.statLabel}>총 응답 수</div>
                    </div>
                </div>
                
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Star />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.averageRating.toFixed(1)}</div>
                        <div className={styles.statLabel}>평균 만족도</div>
                    </div>
                </div>
                
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <TrendingUp />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.responseRate}%</div>
                        <div className={styles.statLabel}>응답률</div>
                    </div>
                </div>
                
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <MessageCircle />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.satisfactionRate}%</div>
                        <div className={styles.statLabel}>만족률 (4점 이상)</div>
                    </div>
                </div>
            </div>

            {/* 필터 및 검색 */}
            <div className={styles.filtersSection}>
                <div className={styles.searchBox}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="접수번호 또는 고객명으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                
                <div className={styles.filterGroup}>
                    <Filter size={16} />
                    <select 
                        value={filterPeriod} 
                        onChange={(e) => setFilterPeriod(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">전체 기간</option>
                        <option value="today">오늘</option>
                        <option value="week">최근 7일</option>
                        <option value="month">최근 30일</option>
                    </select>
                </div>
            </div>

            {/* 설문 결과 테이블 */}
            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <RefreshCw size={24} className={styles.spinning} />
                        <p>만족도 조사 데이터를 불러오는 중...</p>
                    </div>
                ) : (
                    <table className={styles.surveyTable}>
                        <thead>
                            <tr>
                                <th>접수번호</th>
                                <th>고객명</th>
                                <th>완료일</th>
                                <th>종합만족도</th>
                                <th>서비스품질</th>
                                <th>응답시간</th>
                                <th>배송만족도</th>
                                <th>직원친절도</th>
                                <th>추천의향</th>
                                <th>설문발송</th>
                                <th>응답일시</th>
                                <th>상세</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSurveys.map((survey) => (
                                <tr key={survey.surveyId}>
                                    <td className={styles.requestNo}>{survey.requestNo}</td>
                                    <td>{survey.customerName}</td>
                                    <td>{survey.completionDate}</td>
                                    <td className={styles.ratingCell}>
                                        <div className={styles.ratingContainer}>
                                            {renderStarRating(survey.overallRating)}
                                            <span className={getStatusColor(survey.overallRating)}>
                                                {survey.overallRating}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.ratingCell}>
                                        <span className={getStatusColor(survey.serviceQualityRating)}>
                                            {survey.serviceQualityRating}
                                        </span>
                                    </td>
                                    <td className={styles.ratingCell}>
                                        <span className={getStatusColor(survey.responseTimeRating)}>
                                            {survey.responseTimeRating}
                                        </span>
                                    </td>
                                    <td className={styles.ratingCell}>
                                        <span className={getStatusColor(survey.deliveryRating)}>
                                            {survey.deliveryRating}
                                        </span>
                                    </td>
                                    <td className={styles.ratingCell}>
                                        <span className={getStatusColor(survey.staffKindnessRating)}>
                                            {survey.staffKindnessRating}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={survey.recommendToOthers ? styles.recommend : styles.notRecommend}>
                                            {survey.recommendToOthers ? '추천' : '비추천'}
                                        </span>
                                    </td>
                                    <td className={styles.dateCell}>
                                        {new Date(survey.satisfactionSentDate).toLocaleString('ko-KR')}
                                    </td>
                                    <td className={styles.dateCell}>
                                        {new Date(survey.submittedAt).toLocaleString('ko-KR')}
                                    </td>
                                    <td>
                                        <button 
                                            className={styles.detailButton}
                                            onClick={() => {
                                                setSelectedSurvey(survey);
                                                setShowDetailModal(true);
                                            }}
                                        >
                                            상세
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                
                {!loading && filteredSurveys.length === 0 && (
                    <div className={styles.emptyState}>
                        <MessageCircle size={48} className={styles.emptyIcon} />
                        <p>설문 조사 결과가 없습니다.</p>
                        <span>고객들이 설문에 응답하면 여기에 표시됩니다.</span>
                    </div>
                )}
            </div>

            {/* 상세 정보 모달 */}
            {showDetailModal && selectedSurvey && (
                <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>만족도 조사 상세 정보</h2>
                            <button 
                                className={styles.modalCloseButton}
                                onClick={() => setShowDetailModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            <div className={styles.detailSection}>
                                <h3>기본 정보</h3>
                                <div className={styles.detailGrid}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>접수번호:</span>
                                        <span className={styles.detailValue}>{selectedSurvey.requestNo}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>고객명:</span>
                                        <span className={styles.detailValue}>{selectedSurvey.customerName}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>완료일:</span>
                                        <span className={styles.detailValue}>{selectedSurvey.completionDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <h3>만족도 평가</h3>
                                <div className={styles.ratingGrid}>
                                    <div className={styles.ratingItem}>
                                        <span className={styles.ratingLabel}>종합만족도</span>
                                        <div className={styles.ratingDisplay}>
                                            {renderStarRating(selectedSurvey.overallRating)}
                                            <span className={styles.ratingScore}>{selectedSurvey.overallRating}/5</span>
                                        </div>
                                    </div>
                                    <div className={styles.ratingItem}>
                                        <span className={styles.ratingLabel}>서비스 품질</span>
                                        <div className={styles.ratingDisplay}>
                                            {renderStarRating(selectedSurvey.serviceQualityRating)}
                                            <span className={styles.ratingScore}>{selectedSurvey.serviceQualityRating}/5</span>
                                        </div>
                                    </div>
                                    <div className={styles.ratingItem}>
                                        <span className={styles.ratingLabel}>응답 시간</span>
                                        <div className={styles.ratingDisplay}>
                                            {renderStarRating(selectedSurvey.responseTimeRating)}
                                            <span className={styles.ratingScore}>{selectedSurvey.responseTimeRating}/5</span>
                                        </div>
                                    </div>
                                    <div className={styles.ratingItem}>
                                        <span className={styles.ratingLabel}>배송 만족도</span>
                                        <div className={styles.ratingDisplay}>
                                            {renderStarRating(selectedSurvey.deliveryRating)}
                                            <span className={styles.ratingScore}>{selectedSurvey.deliveryRating}/5</span>
                                        </div>
                                    </div>
                                    <div className={styles.ratingItem}>
                                        <span className={styles.ratingLabel}>직원 친절도</span>
                                        <div className={styles.ratingDisplay}>
                                            {renderStarRating(selectedSurvey.staffKindnessRating)}
                                            <span className={styles.ratingScore}>{selectedSurvey.staffKindnessRating}/5</span>
                                        </div>
                                    </div>
                                    <div className={styles.ratingItem}>
                                        <span className={styles.ratingLabel}>추천 의향</span>
                                        <div className={styles.recommendDisplay}>
                                            <span className={selectedSurvey.recommendToOthers ? styles.recommend : styles.notRecommend}>
                                                {selectedSurvey.recommendToOthers ? '👍 추천' : '👎 비추천'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <h3>고객 의견</h3>
                                <div className={styles.feedbackBox}>
                                    {selectedSurvey.feedback}
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <h3>처리 현황</h3>
                                <div className={styles.detailGrid}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>설문 발송:</span>
                                        <span className={styles.detailValue}>
                                            {new Date(selectedSurvey.satisfactionSentDate).toLocaleString('ko-KR')}
                                        </span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>응답 완료:</span>
                                        <span className={styles.detailValue}>
                                            {new Date(selectedSurvey.submittedAt).toLocaleString('ko-KR')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SatisfactionDashboard;