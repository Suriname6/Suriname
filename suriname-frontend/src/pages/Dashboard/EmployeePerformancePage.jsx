import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import SidebarNavigation from "../../components/SidebarNavigation.jsx";

export default function PerformanceDashboardPage() {
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [data, setData] = useState([]);

    // 날짜 변경 핸들러
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange((prev) => ({ ...prev, [name]: value }));
    };

    // 데이터 가져오기
    const fetchData = async () => {
        try {
            const res = await axios.get("/api/performance", { params: dateRange });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApply = () => fetchData();

    return (
        <div className="dashboard-container">
            <SidebarNavigation />
            <main className="dashboard-main">
                <div className="p-6 space-y-6">
                    {/* 📅 날짜 필터 */}
                    <div className="flex items-center gap-2">
                        <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} />
                        <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} />
                        <button onClick={handleApply} className="px-4 py-2 bg-gray-700 text-white rounded">
                            적용
                        </button>
                    </div>

                    {/* 📊 성과 차트 */}
                    <BarChart width={700} height={300} data={data}>
                        <XAxis dataKey="employeeName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="assigned" fill="#4FC3F7" name="배정 건수" />
                        <Bar dataKey="completed" fill="#81C784" name="완료 건수" />
                    </BarChart>

                    {/* 📋 성과 테이블 */}
                    <table className="w-full text-sm text-left border">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">담당자</th>
                            <th className="p-2 border">배정 건수</th>
                            <th className="p-2 border">완료 건수</th>
                            <th className="p-2 border">완료율</th>
                            <th className="p-2 border">평균 소요 시간</th>
                            <th className="p-2 border">평균 만족도</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                <td className="p-2 border">{row.employeeName}</td>
                                <td className="p-2 border">{row.assigned}</td>
                                <td className="p-2 border">{row.completed}</td>
                                <td className="p-2 border">
                                    {row.assigned > 0 ? ((row.completed / row.assigned) * 100).toFixed(1) + "%" : "0%"}
                                </td>
                                <td className="p-2 border">{row.avgDuration}일</td>
                                <td className="p-2 border">{row.avgSatisfaction}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
