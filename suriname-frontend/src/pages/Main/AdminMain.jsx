import React, { useEffect, useState } from "react";
import illustration from "../../assets/illustration.png";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function AdminMainPage() {
  // 오늘 현황
  const [today, setToday] = useState({
    newRequests: 0,
    unassigned: 0,
    inProgress: 0,
    completed: 0,
    delayed: 0,
  });
  const navigate = useNavigate();

  // 오늘 접수 리스트
  const [todayRequests, setTodayRequests] = useState([]);

  // 이번 주 요약 / 기사 TOP5
  const [weeklySummary, setWeeklySummary] = useState({
    total: 0,
    byDay: [], // [{day:'Mon', count: 12}, ...]
  });
  const [topEngineers, setTopEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [todayRes, weekRes] = await Promise.all([
          api.get("/api/main/admin/today"),
          api.get("/api/main/admin/week"),
        ]);

        if (ignore) return;

        // today: { stats, requests }
        const { stats, requests } = todayRes.data || {};
        if (stats) setToday(stats);
        if (Array.isArray(requests)) setTodayRequests(requests);

        // week: { total, byDay, topEngineers }
        const { total, byDay, topEngineers: tops } = weekRes.data || {};
        setWeeklySummary({
          total: total ?? 0,
          byDay: Array.isArray(byDay)
            ? byDay.map((d) => ({ day: d.day, count: d.count }))
            : [],
        });
        setTopEngineers(Array.isArray(tops) ? tops : []);
      } catch (e) {
        console.error("Admin dashboard load failed:", e);
        setError("대시보드 데이터를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // 상태 뱃지
  const badge = (status) => {
    const map = {
      RECEIVED: "bg-gray-100 text-gray-700",
      REPAIRING: "bg-blue-100 text-blue-700",
      WAITING_FOR_PAYMENT: "bg-yellow-100 text-yellow-800",
      WAITING_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
      COMPLETED: "bg-emerald-100 text-emerald-700",
    };
    return `px-2 py-0.5 rounded-full text-xs font-semibold ${
      map[status] || "bg-gray-100 text-gray-700"
    }`;
  };

  // 상태 코드 → 한글 라벨
  const statusLabel = (status) => {
    const map = {
      RECEIVED: "접수",
      REPAIRING: "수리중",
      WAITING_FOR_PAYMENT: "입금대기",
      WAITING_FOR_DELIVERY: "배송대기",
      COMPLETED: "완료",
    };
    return map[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-[170px] p-8 space-y-8">
        {loading && (
          <div className="max-w-6xl mx-auto text-sm text-gray-500">
            로딩 중…
          </div>
        )}
        {!!error && (
          <div className="max-w-6xl mx-auto text-sm text-red-600">{error}</div>
        )}
        {/* 헤더 */}
        <div className="mb-8">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-12">
            {/* 왼쪽 텍스트 영역 */}
            <div className="flex flex-col items-center text-center max-w-2xl">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                관리자님 환영합니다
              </h1>
              <div className="text-gray-600 bg-blue-50 px-6 py-4 rounded-lg inline-block text-lg">
                오늘의 운영현황을 확인하고 관리 작업을 시작해보세요
              </div>
            </div>

            {/* 오른쪽 이미지 영역 */}
            <div className="w-80 h-48 rounded-lg flex items-center justify-center shrink-0">
              <img
                src={illustration}
                alt="illustration"
                className="h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* 상단: 오늘 현황 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: "신규 접수", value: today.newRequests },
            { label: "미배정", value: today.unassigned },
            { label: "진행 중", value: today.inProgress },
            { label: "완료", value: today.completed },
            { label: "지연", value: today.delayed },
          ].map((c, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
            >
              <div className="text-sm text-gray-500">{c.label}</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                {c.value}건
              </div>
            </div>
          ))}
        </div>

        {/* 중앙: 오늘 접수 / 이슈 패널 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 오늘 접수 (좌측 2칸) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">오늘 접수</h2>
              {/* <button className="text-sm text-blue-600" onClick={()=>{}}>더보기</button> */}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "접수번호",
                      "고객명",
                      "제품명",
                      "상태",
                      "담당 기사",
                      "접수 시간",
                      "빠른 작업",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-center text-sm font-medium text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayRequests.length === 0 ? (
                    <tr>
                      <td
                        className="px-6 py-8 text-center text-sm text-gray-500"
                        colSpan={7}
                      >
                        오늘 접수된 항목이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    todayRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-center text-gray-900">
                          {r.requestNo}
                        </td>
                        <td className="px-6 py-3 text-sm text-center text-gray-900">
                          {r.customer}
                        </td>
                        <td className="px-6 py-3 text-sm text-center text-gray-900">
                          {r.product}
                        </td>
                        <td className="px-6 py-3 text-sm text-center">
                          <span className={badge(r.status)}>
                            {statusLabel(r.status)}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-center text-gray-900">
                          {r.engineer}
                        </td>
                        <td className="px-6 py-3 text-sm text-center text-gray-900">
                          {r.createdAt}
                        </td>
                        <td className="px-6 py-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate("/requests/:id")}
                              className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                            >
                              상세
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 하단: 이번 주 요약 + 기사 TOP5 + 빠른 액션 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 이번 주 요약 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">이번 주 요약</h3>
              <span className="text-sm text-gray-500">
                총 {weeklySummary.total}건
              </span>
            </div>
            {/* 미니 차트 대체 바 */}
            <div className="space-y-2">
              {weeklySummary.byDay.map((d) => (
                <div key={d.day}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{d.day}</span>
                    <span>{d.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded">
                    <div
                      className="h-2 bg-blue-600 rounded"
                      style={{ width: `${Math.min(100, d.count)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 기사 TOP5 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              기사 처리량 TOP 5
            </h3>
            <div className="space-y-3">
              {topEngineers.map((e, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm text-gray-800 mb-1">
                    <span>
                      {i + 1}. {e.name}
                    </span>
                    <span className="font-semibold">{e.count}건</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded">
                    <div
                      className="h-2 bg-emerald-600 rounded"
                      style={{ width: `${Math.min(100, e.count)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4">빠른 액션</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/repair/write")}
                className="py-3 rounded-lg border hover:bg-gray-50"
              >
                수리 요청 등록
              </button>
              <button
                onClick={() => navigate("/repair/list")}
                className="py-3 rounded-lg border hover:bg-gray-50"
              >
                기사 배정
              </button>
              <button
                onClick={() => navigate("/customer/list")}
                className="py-3 rounded-lg border hover:bg-gray-50"
              >
                고객 관리
              </button>
              <button
                onClick={() => navigate("/product/list")}
                className="py-3 rounded-lg border hover:bg-gray-50"
              >
                제품 관리
              </button>
              <button
                onClick={() => navigate("/dashboard/statistics")}
                className="py-3 rounded-lg border hover:bg-gray-50"
              >
                통계 대시보드
              </button>
              <button
                onClick={() => navigate("/dashboard/report")}
                className="py-3 rounded-lg border hover:bg-gray-50"
              >
                리포트 생성
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
