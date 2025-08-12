import { PDFDownloadLink, PDFViewer, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import EmployeePerformancePage from './EmployeePerformancePage';

Font.register({
    family: 'NotoSansKR',
    src: 'https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Regular.woff2',
    fontStyle: 'normal',
    fontWeight: 'normal',
});

const styles = StyleSheet.create({
    page: {
        padding: 24,
        fontFamily: 'NotoSansKR',
        fontSize: 12,
        backgroundColor: '#F3F4F6',
    },
    section: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#FFF',
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#2563EB',
    },
    subtitle: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#374151',
    },
    text: {
        marginBottom: 2,
        color: '#374151',
    },
    table: {
        display: 'table',
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeader: {
        backgroundColor: '#F3F4F6',
    },
    tableCell: {
        flex: 1,
        padding: 6,
        fontSize: 11,
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    lastCell: {
        borderRightWidth: 0,
    },
});

// PDF 문서 정의 (실제 데이터는 props로 받아서 넣어야 함)
const ReportPDFDocument = ({ adminStats, employeeStats }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' }}>
                    통합 통계 리포트
                </Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>관리자 통계 요약</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.tableCell}>총 요청</Text>
                        <Text style={styles.tableCell}>오늘 요청</Text>
                        <Text style={styles.tableCell}>미완료 요청</Text>
                        <Text style={styles.tableCell}>완료율</Text>
                        <Text style={styles.tableCell}>총 매출</Text>
                        <Text style={[styles.tableCell, styles.lastCell]}>평균 수리비</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>{adminStats?.totalRequestCount ?? '-'}</Text>
                        <Text style={styles.tableCell}>{adminStats?.todayRequestCount ?? '-'}</Text>
                        <Text style={styles.tableCell}>{adminStats?.uncompletedCount ?? '-'}</Text>
                        <Text style={styles.tableCell}>{adminStats?.completedRatio ? `${(adminStats.completedRatio * 100).toFixed(1)}%` : '-'}</Text>
                        <Text style={styles.tableCell}>{adminStats?.totalRevenue ?? '-'}</Text>
                        <Text style={[styles.tableCell, styles.lastCell]}>{adminStats?.averageRepairCost ?? '-'}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>직원별 성과</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.tableCell}>담당자</Text>
                        <Text style={styles.tableCell}>배정 건수</Text>
                        <Text style={styles.tableCell}>완료 건수</Text>
                        <Text style={styles.tableCell}>완료율</Text>
                        <Text style={styles.tableCell}>평균 소요 시간</Text>
                        <Text style={[styles.tableCell, styles.lastCell]}>평균 만족도</Text>
                    </View>
                    {employeeStats && employeeStats.length > 0 ? (
                        employeeStats.map((emp, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{emp.employeeName}</Text>
                                <Text style={styles.tableCell}>{emp.assignedCount}</Text>
                                <Text style={styles.tableCell}>{emp.completedCount}</Text>
                                <Text style={styles.tableCell}>{emp.completionRate ? `${(emp.completionRate * 100).toFixed(1)}%` : '-'}</Text>
                                <Text style={styles.tableCell}>{emp.averageCompletionHours ?? '-'}</Text>
                                <Text style={[styles.tableCell, styles.lastCell]}>{emp.averageRating ?? '-'}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>직원 데이터 없음</Text>
                        </View>
                    )}
                </View>
            </View>
        </Page>
    </Document>
);

import {useEffect, useRef, useState, useCallback} from 'react';

export default function ReportPage() {
    const [adminStats, setAdminStats] = useState(null);
    const [employeeStats, setEmployeeStats] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const chartRef = useRef(null);

    // 실제 데이터 fetch 로직 필요 (아래는 예시)

    // 관리자 통계 데이터 fetch 함수 (AdminDashboard와 유사하게)
    const fetchCardData = useCallback(async () => {
        try {
            const axios = (await import('axios')).default;
            const response = await axios.get('/api/analytics/statistics');
            setAdminStats(response.data);
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
            setAdminStats(null);
        }
    }, []);

    // 직원별 성과 데이터 fetch 함수
    const fetchEmployeeStats = useCallback(async () => {
        try {
            const axios = (await import('axios')).default;
            const response = await axios.get('/api/analytics/employees');
            setEmployeeStats(response.data);
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
            setEmployeeStats([]);
        }
    }, []);

    useEffect(() => {
        fetchCardData();
        fetchEmployeeStats();
    }, [fetchCardData, fetchEmployeeStats]);

    return (
        <div className="relative space-y-10 p-8 bg-gray-50 min-h-screen">
            {/* PDF 다운로드 버튼 */}
            <div className="absolute top-8 right-8 z-10 flex gap-2">
                {adminStats && employeeStats.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            className="flex items-center gap-2 px-4 py-2 border border-gray-400 bg-white text-gray-700 rounded shadow hover:bg-gray-50 transition font-medium"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            {showPreview ? "미리보기 닫기" : "미리보기"}
                        </button>
                        <PDFDownloadLink
                            document={<ReportPDFDocument adminStats={adminStats} employeeStats={employeeStats} />}
                            fileName="통합_통계_리포트.pdf"
                            className="flex items-center gap-2 px-4 py-2 border border-blue-600 bg-white text-blue-600 rounded shadow hover:bg-blue-50 transition font-medium"
                        >
                            {({ loading }) => (
                                <>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 5v14M19 12l-7 7-7-7"/>
                                    </svg>
                                    {loading ? "PDF 생성 중..." : "다운로드"}
                                </>
                            )}
                        </PDFDownloadLink>
                    </div>
                )}
            </div>
            {/* PDF 미리보기: 버튼 클릭 시만 표시 */}
            {showPreview && adminStats && employeeStats.length > 0 && (
                <div className="my-8 bg-white rounded shadow overflow-auto"
                    style={{ height: "700px", marginTop: "50px", marginLeft: "240px", marginRight: "100px" }}>
                    <PDFViewer width="100%" height="700">
                        <ReportPDFDocument adminStats={adminStats} employeeStats={employeeStats} />
                    </PDFViewer>
                </div>
            )}
            {/* 실제 화면에는 기존 대시보드 컴포넌트 그대로 표시 */}
            <div id="report-dashboard-section">
                <AdminDashboard ref={chartRef} />
                <EmployeePerformancePage />
            </div>
        </div>
    );
}