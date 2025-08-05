import { Button, Card, CardContent, Input } from "@mui/material";
import { Users } from "lucide-react";
import React from "react";
import { ChartSection } from "../ChartSection";
import { StatisticsSection } from "../StatisticsSection";

const timeOptions = [
  { label: "일간", value: "daily" },
  { label: "주간", value: "weekly" },
  { label: "월간", value: "monthly" },
  { label: "연간", value: "yearly" },
];

const statisticsData = [
  {
    title: "신규 접수",
    value: "32",
    change: "8.5% 어제보다 증가",
    icon: Users,
  },
  {
    title: "처리 중",
    value: "23",
    icon: Users,
  },
];

const metricsData = [
  {
    title: "평균 처리 완료 수",
    value: "2.3일",
  },
  {
    title: "평균 고객 만족도",
    value: "4.6",
  },
];

export default function AdminDashboard() {
  return (
      <div className="bg-white flex flex-row justify-center w-full min-h-screen">
        <div className="bg-white w-full max-w-[1440px] relative">
          <div className="flex">
            <main className="flex-1 p-6">
              <header className="mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex gap-4">
                    <Input type="date" className="w-auto" defaultValue="" />
                    <Input type="date" className="w-auto" defaultValue="" />
                  </div>
                </div>

                <div className="flex gap-6 mb-6">
                  {statisticsData.map((stat, index) => (
                      <Card
                          key={index}
                          className="min-w-[386px] shadow-[6px_6px_54px_#0000000d]"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 opacity-70 [font-family:'Nunito_Sans-SemiBold',Helvetica] font-semibold text-[#202224] text-2xl tracking-[0] leading-[normal] mb-4">
                            <stat.icon className="w-6 h-6 text-blue-500" />
                            <span className="text-2xl text-gray-600">
                            {stat.title}
                          </span>
                          </div>
                          <div className="[font-family:'Nunito_Sans-Bold',Helvetica] font-bold text-[#202224] text-5xl tracking-[1.00px] leading-[normal]">
                            {stat.value}
                          </div>
                          {stat.change && (
                              <div className="text-sm text-green-600">
                                {stat.change}
                              </div>
                          )}
                        </CardContent>
                      </Card>
                  ))}
                </div>

                <div className="flex gap-6 mb-6">
                  {metricsData.map((metric, index) => (
                      <Card
                          key={index}
                          className="min-w-[386px] shadow-[6px_6px_54px_#0000000d]"
                      >
                        <CardContent className="p-6">
                          <div className="opacity-70 [font-family:'Nunito_Sans-SemiBold',Helvetica] font-semibold text-[#202224] text-2xl tracking-[0] leading-[normal] mb-4">
                            {metric.title}
                          </div>
                          <div className="[font-family:'Nunito_Sans-Bold',Helvetica] font-bold text-[#202224] text-5xl tracking-[1.00px] leading-[normal]">
                            {metric.value}
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
              </header>

              <StatisticsSection />
              <ChartSection />
            </main>
          </div>
        </div>
      </div>
  );
}