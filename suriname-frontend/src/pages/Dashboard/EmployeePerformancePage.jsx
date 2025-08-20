import { useState, useEffect } from "react";
import axios from "axios";
import {BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer} from "recharts";
import SidebarNavigation from "../../components/SidebarNavigation.jsx";

export default function PerformanceDashboardPage() {
    const [data, setData] = useState([]);
    const [visibleCount, setVisibleCount] = useState(10);

    // 데이터 가져오기
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get("/api/analytics/employees", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const top10Data = data.slice(0, 10);

    return (
        <div className="dashboard-container bg-gray-50 min-h-screen">
        <SidebarNavigation />
        <main className="dashboard-main">
            <div className="p-8 space-y-8 max-w-5xl mx-auto">
                {/* 📊 성과 차트 */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">직원별 성과 차트 (TOP 10)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={top10Data}
                        margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                        barCategoryGap="30%" // 막대 간격
                    >
                        <XAxis 
                        dataKey="employeeName" 
                        interval={0} // 모든 라벨 표시
                        tick={{ fontSize: 12 }} 
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="assignedCount" fill="#4FC3F7" name="배정 건수" />
                        <Bar dataKey="completedCount" fill="#81C784" name="완료 건수" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 📋 성과 테이블 */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">직원별 성과 테이블</h2>
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border-b">담당자</th>
                                <th className="p-3 border-b">배정 건수</th>
                                <th className="p-3 border-b">완료 건수</th>
                                <th className="p-3 border-b">완료율</th>
                                <th className="p-3 border-b">평균 소요 시간</th>
                                <th className="p-3 border-b">평균 만족도</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, visibleCount).map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition">
                                    <td className="p-3 border-b">{row.employeeName}</td>
                                    <td className="p-3 border-b">{row.assignedCount}</td>
                                    <td className="p-3 border-b">{row.completedCount}</td>
                                    <td className="p-3 border-b">
                                        {row.assignedCount > 0 ? ((row.completedCount / row.assignedCount) * 100).toFixed(1) + "%" : "0%"}
                                    </td>
                                    <td className="p-3 border-b">{row.averageCompletionHours}일</td>
                                    <td className="p-3 border-b">{row.averageRating != null ? row.averageRating : "N/A"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {visibleCount < data.length && (
                        <div className="flex justify-center mt-4">
                            <button
                                className="px-5 py-2 border border-blue-600 text-blue-600 bg-white rounded hover:bg-blue-50 transition font-medium"
                                onClick={() => setVisibleCount(visibleCount + 10)}
                            >
                                더보기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    </div>
    );
}
