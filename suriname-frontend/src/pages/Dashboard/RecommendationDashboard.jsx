import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../../css/RecommendationDashboard.css";

function RecommendationDashboard() {
  const [recommendations, setRecommendations] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios.get("/api/recommendations").then((res) => {
      setRecommendations(res.data);
      setChartData(res.data);
    });
  }, []);

  const dynamicWidth = Math.max(600, chartData.length * 80);

  return (
    <div className="recommendation-dashboard">
      <h1>피드백 현황</h1>
      <div className="recommendation-list">
        {recommendations.length === 0 ? (
          <p>현재 표시할 권고 사항이 없습니다.</p>
        ) : (
          recommendations.map((rec, idx) => (
            <div key={idx} className="recommendation-item">
              <div className="recommendation-model">{rec.modelName}</div>
              <div className="recommendation-message">{rec.message}</div>
            </div>
          ))
        )}
      </div>

      <h1>수리 건 수 현황</h1>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            width={dynamicWidth}
            margin={{ top: 20, right: 30, left: 10, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="modelName"
              textAnchor="middle"
              interval={0}
              height={70}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="repairCount"
              fill="#3b82f6"
              name="수리 건 수"
              barSize={Math.max(20, 60 - chartData.length)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RecommendationDashboard;
