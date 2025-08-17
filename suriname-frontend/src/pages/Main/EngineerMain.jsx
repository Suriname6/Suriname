import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "../../assets/illustration.png";
import api from "../../api/api";

export default function RepairTechnicianMainPage() {
  const navigate = useNavigate();

  // 목록 페이지네이션
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  // 서버 데이터
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 상태 필터
  const [status, setStatus] = useState("");

  // 대시보드 요약(오늘/주간/비율/누적)
  const [summary, setSummary] = useState({
    todayCompletedCount: 0,
    weekCompletedCount: 0,
    monthCompletedCount: 0,
    statusCounts: {},
  });

  // 권한 체크
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "ENGINEER") {
      navigate("/login");
    }
  }, [navigate]);

  // 내 수리 목록 로드
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/requests/my", {
          params: { page, size, ...(status ? { status } : {}) },
        });
        const content = res.data?.content ?? [];
        setRows(content);
        setTotalPages(res.data?.totalPages ?? 0);
      } catch (e) {
        console.error(e);
        setError("내 수리 내역을 불러오는 중 오류가 발생했어요.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, size, status]);

  // 요약 데이터 로드
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await api.get("/api/requests/summary/engineer");
        setSummary({
          todayCompletedCount: res.data?.todayCompletedCount ?? 0,
          weekCompletedCount: res.data?.weekCompletedCount ?? 0,
          monthCompletedCount: res.data?.monthCompletedCount ?? 0,
          statusCounts: res.data?.statusCounts ?? {},
        });
      } catch (e) {
        console.error("요약 로드 실패", e);
      }
    };
    loadSummary();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // 상태 -> 한글 매핑
  const statusLabels = {
    RECEIVED: "접수",
    REPAIRING: "수리중",
    WAITING_FOR_PAYMENT: "입금대기",
    WAITING_FOR_DELIVERY: "배송대기",
    COMPLETED: "완료",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-[170px] p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-12">
            {/* 왼쪽 텍스트 영역 */}
            <div className="flex flex-col items-center text-center max-w-2xl">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                수리기사님 환영합니다
              </h1>
              <div className="text-gray-600 bg-blue-50 px-6 py-4 rounded-lg inline-block text-lg">
                오늘 배정된 수리 요청을 확인하고 수리 내역을 등록해 주세요
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

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-1">
              오늘 완료
            </h3>
            <div className="text-3xl font-semibold text-gray-800 text-center">
              {summary.todayCompletedCount}건
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-1">
              이번 주 누적
            </h3>
            <div className="text-3xl font-semibold text-gray-800 text-center">
              {summary.weekCompletedCount}건
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-1">
              이번 달 누적
            </h3>
            <div className="text-3xl font-semibold text-gray-800 text-center">
              {summary.monthCompletedCount}건
            </div>
          </div>
        </div>

        {/* 진행 상태 비율 (풀폭) */}
        <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            나의 진행 상태 비율
          </h3>
          {[
            "RECEIVED",
            "REPAIRING",
            "WAITING_FOR_PAYMENT",
            "WAITING_FOR_DELIVERY",
            "COMPLETED",
          ].map((k) => {
            const cnt = summary.statusCounts?.[k] ?? 0;
            const total = Object.values(summary.statusCounts || {}).reduce(
              (a, b) => a + b,
              0
            );
            const p = total ? Math.round((cnt / total) * 100) : 0;
            const labels = {
              RECEIVED: "접수",
              REPAIRING: "수리중",
              WAITING_FOR_PAYMENT: "입금대기",
              WAITING_FOR_DELIVERY: "배송대기",
              COMPLETED: "완료",
            };
            return (
              <div key={k} className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{labels[k]}</span>
                  <span>
                    {cnt}건 · {p}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded h-2">
                  <div
                    className="h-2 rounded bg-blue-600"
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="text-right text-xs text-gray-400 mt-1">
            총{" "}
            {Object.values(summary.statusCounts || {}).reduce(
              (a, b) => a + b,
              0
            )}
            건 기준
          </div>
        </div>
        {/* 필터 */}
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm text-gray-600">상태</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value);
            }}
          >
            <option value="">전체</option>
            <option value="RECEIVED">접수</option>
            <option value="REPAIRING">수리중</option>
            <option value="WAITING_FOR_PAYMENT">입금대기</option>
            <option value="WAITING_FOR_DELIVERY">배송대기</option>
            <option value="COMPLETED">완료</option>
          </select>
        </div>

        {/* 수리 목록 테이블 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">내 수리 목록</h2>
            {loading && (
              <span className="text-sm text-gray-500">불러오는 중…</span>
            )}
            {error && <span className="text-sm text-red-500">{error}</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    접수번호
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    고객명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    제품명
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    모델코드
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    접수일자
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    수리상태
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      표시할 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.requestId}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {r.requestNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {r.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {r.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {r.modelCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {statusLabels[r.status] || r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                disabled={page === 0 || loading}
              >
                이전
              </button>
              <span className="text-sm text-gray-600">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
                className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                disabled={page + 1 >= totalPages || loading}
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
