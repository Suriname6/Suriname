import React, { useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from "recharts";

const Dashboard = () => {
    const [dateRange, setDateRange] = useState("월간");

    const handleDateChange = (e) => {
        setDateRange(e.target.value);
    };

    const newRequests = 32;
    const inProgress = 23;
    const trendData = [
        { month: "Jan", count: 40 },
        { month: "Feb", count: 25 },
        { month: "Mar", count: 30 },
        { month: "Apr", count: 60 },
        { month: "May", count: 50 },
        { month: "Jun", count: 55 },
    ];

    const productData = [
        { name: "게이밍 노트북", count: 83 },
        { name: "키보드", count: 64 },
        { name: "헤드셋", count: 70 },
        { name: "스피커", count: 64 },
        { name: "마우스", count: 53 },
    ];

    return (
        <div className="p-8 w-full">
            {/* 상단 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white shadow rounded-xl p-6">
                    <p className="text-gray-500 text-sm">신규 접수</p>
                    <h2 className="text-3xl font-semibold mt-2">{newRequests}</h2>
                    <p className="text-sm text-green-600 mt-1">▲ 8.5% 어제보다 증가</p>
                </div>
                <div className="bg-white shadow rounded-xl p-6">
                    <p className="text-gray-500 text-sm">처리 중</p>
                    <h2 className="text-3xl font-semibold mt-2">{inProgress}</h2>
                    <div className="mt-3">
                        <input type="date" className="mr-2 border rounded px-2 py-1" />
                        <input type="date" className="border rounded px-2 py-1" />
                        <select
                            value={dateRange}
                            onChange={handleDateChange}
                            className="ml-2 border px-2 py-1 rounded"
                        >
                            <option value="일간">일간</option>
                            <option value="주간">주간</option>
                            <option value="월간">월간</option>
                            <option value="연간">연간</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 선 그래프 */}
            <div className="bg-white shadow rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4">기간별 A/S 추이</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trendData}>
                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 막대 그래프 */}
            <div className="bg-white shadow rounded-xl p-6">
                <h3 className="font-semibold mb-4">제품별 A/S 건수</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;