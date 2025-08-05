import { Button, Card, CardContent } from "@mui/material";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import React from "react";

export const StatisticsSection = () => {
    const monthLabels = [
        { label: "Jan" },
        { label: "Feb" },
        { label: "Mar" },
        { label: "Apr" },
        { label: "May" },
        { label: "Jun" },
    ];

    return (
        <Card className="w-full bg-neutral-50 rounded-3xl shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <h2 className="text-lg font-semibold text-[#557ade]">
                            기간별 A/S 추이
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            className="h-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-2xl"
                        >
                            <span className="text-sm font-normal text-gray-900">월간</span>
                            <ChevronDown className="w-5 h-5 ml-2" />
                        </Button>

                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 bg-gray-100 hover:bg-gray-200 rounded-2xl"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="relative h-[280px] mb-6">
                    <div className="relative w-full h-full">
                        <svg className="w-full h-full" viewBox="0 0 1089 280">
                            <defs>
                                <linearGradient
                                    id="chartGradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="0%"
                                    y2="100%"
                                >
                                    <stop offset="0%" stopColor="#557ade" stopOpacity="0.1" />
                                    <stop offset="100%" stopColor="#557ade" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            <path
                                d="M 50 180 L 200 220 L 350 160 L 500 140 L 650 120 L 800 100 L 950 130"
                                stroke="#557ade"
                                strokeWidth="2"
                                fill="none"
                            />

                            <path
                                d="M 50 180 L 200 220 L 350 160 L 500 140 L 650 120 L 800 100 L 950 130 L 950 280 L 50 280 Z"
                                fill="url(#chartGradient)"
                            />

                            <circle
                                cx="50"
                                cy="180"
                                r="4"
                                fill="#557ade"
                                stroke="white"
                                strokeWidth="2"
                            />
                            <circle
                                cx="200"
                                cy="220"
                                r="4"
                                fill="#557ade"
                                stroke="white"
                                strokeWidth="2"
                            />
                            <circle
                                cx="350"
                                cy="160"
                                r="4"
                                fill="#557ade"
                                stroke="white"
                                strokeWidth="2"
                            />
                            <circle
                                cx="500"
                                cy="140"
                                r="4"
                                fill="#557ade"
                                stroke="white"
                                strokeWidth="2"
                            />
                            <circle
                                cx="650"
                                cy="120"
                                r="4"
                                fill="#557ade"
                                stroke="white"
                                strokeWidth="2"
                            />
                            <circle
                                cx="800"
                                cy="100"
                                r="4"
                                fill="#557ade"
                                stroke="white"
                                strokeWidth="2"
                            />
                            <circle
                                cx="950"
                                cy="130"
                                r="4"
                                fill="#557ade"
                                stroke="white"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {monthLabels.map((month, index) => (
                        <div key={index} className="flex-1 text-center">
              <span className="text-sm font-normal text-gray-900">
                {month.label}
              </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default StatisticsSection;