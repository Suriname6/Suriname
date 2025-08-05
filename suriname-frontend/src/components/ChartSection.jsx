import { Card, CardContent } from "@mui/material";
import React from "react";

export const ChartSection = () => {
    const chartData = [
        { label: "게이밍 노트북", value: 83 },
        { label: "키보드", value: 64 },
        { label: "헤드셋", value: 70 },
        { label: "스피커", value: 64 },
        { label: "마우스", value: 53 },
    ];

    const scaleValues = [0, 20, 40, 60, 80, 100];

    return (
        <Card className="w-full bg-example-universalpalette-fill-bg rounded-3xl">
            <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                    <header className="flex h-10 items-end">
                        <div className="flex flex-col items-start justify-center">
                            <h2 className="font-18-semibold font-[number:var(--18-semibold-font-weight)] text-[#557ade] text-[length:var(--18-semibold-font-size)] tracking-[var(--18-semibold-letter-spacing)] leading-[var(--18-semibold-line-height)] [font-style:var(--18-semibold-font-style)]">
                                제품별 A/S건수
                            </h2>
                        </div>
                    </header>

                    <div className="flex flex-col gap-2 p-2 flex-1">
                        <div className="flex flex-col flex-1">
                            <div className="flex items-start justify-between pl-[74px] pr-0 py-0 mb-2">
                                {scaleValues.map((value, index) => (
                                    <div
                                        key={index}
                                        className="text-example-universalpalette-text-regular text-xs [font-family:'Inter-Regular',Helvetica] font-normal tracking-[0] leading-[normal]"
                                    >
                                        {value}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-0.5 px-2 py-0 flex-1">
                                <div className="flex flex-col px-0.5 py-0 w-[70px]">
                                    {chartData.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-end justify-center h-12"
                                        >
                                            <div className="text-example-universalpalette-text-regular text-xs [font-family:'Inter-Regular',Helvetica] font-normal tracking-[0] leading-[normal]">
                                                {item.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex-1 flex flex-col gap-1">
                                    {chartData.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center h-12 relative"
                                        >
                                            <div className="w-full h-6 bg-gray-100 rounded relative">
                                                <div
                                                    className="h-full bg-[#557ade] opacity-80 rounded flex items-center justify-end pr-2"
                                                    style={{ width: `${item.value}%` }}
                                                >
                          <span className="text-example-universalpalette-text-regular text-sm [font-family:'Inter-Regular',Helvetica] font-normal tracking-[0] leading-[normal] ml-2">
                            {item.value}
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
