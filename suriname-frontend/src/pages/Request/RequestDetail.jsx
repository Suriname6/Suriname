import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState("");

  const [role] = useState(localStorage.getItem("role") || "");

  // --- 고객 자동완성 상태 ---
  const [customerName, setCustomerName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const reqSeqRef = useRef(0); // 최신 요청 번호 가드

  // 상세 조회
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`/api/requests/${id}`);
        setDetail(res.data);
        // 초기 로드 시 입력창에 고객명 세팅
        setCustomerName(res.data?.customerName ?? "");
      } catch (err) {
        console.error("요청 상세 정보 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // 고객명 입력 → 디바운스 자동완성
  useEffect(() => {
    if (!customerName || !customerName.trim()) {
      setSuggestions([]);
      return;
    }

    const seq = ++reqSeqRef.current;
    const timer = setTimeout(async () => {
      try {
        setLoadingSuggest(true);
        const res = await axios.get(`/api/customers/autocomplete`, {
          params: { keyword: customerName },
        });
        // 최신 요청만 반영
        if (seq === reqSeqRef.current) {
          setSuggestions(res.data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        if (seq === reqSeqRef.current) {
          console.error("자동완성 데이터 불러오기 실패", err);
          setSuggestions([]);
        }
      } finally {
        if (seq === reqSeqRef.current) setLoadingSuggest(false);
      }
    }, 220); // 디바운스

    return () => clearTimeout(timer);
  }, [customerName]);

  // 입력 핸들러
  const handleCustomerChange = (e) => {
    setCustomerName(e.target.value);
  };

  // 선택 핸들러 (한 번 클릭에 반영 & 닫힘)
  const handleSelectCustomer = (customer) => {
    setCustomerName(customer.name);
    setSuggestions([]);
    setShowSuggestions(false);

    // 고객/제품 정보 detail에 덮어쓰기 (product가 있을 때만)
    setDetail((prev) => ({
      ...prev,
      customerId: customer.customerId,
      customerName: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      productName: customer.product?.productName ?? prev?.productName ?? "",
      modelCode: customer.product?.modelCode ?? prev?.modelCode ?? "",
      productBrand: customer.product?.productBrand ?? prev?.productBrand ?? "",
      serialNumber: customer.product?.serialNumber ?? prev?.serialNumber ?? "",
    }));
  };

  const updateAssignmentStatus = async (requestId, status, reason = "") => {
    try {
      await axios.put(`/api/requests/${requestId}/assignment-status`, {
        status,
        reason,
      });
      alert("상태가 변경되었습니다.");
      const res = await axios.get(`/api/requests/${id}`);
      setDetail(res.data);
      setShowRejectModal(false);
      setRejectReason("");
    } catch (err) {
      console.error("상태 변경 실패", err);
      alert("상태 변경에 실패했습니다.");
    }
  };

  const handleReassign = () => setShowReassignModal(true);

  const reassignEngineer = async () => {
    if (!selectedEngineerId.trim()) {
      alert("기사 ID를 입력해주세요.");
      return;
    }
    try {
      await axios.put(`/api/requests/${id}/assignment-engineer`, {
        employeeId: selectedEngineerId,
      });
      alert("기사가 재배정되었습니다.");
      const res = await axios.get(`/api/requests/${id}`);
      setDetail(res.data);
      setShowReassignModal(false);
      setSelectedEngineerId("");
    } catch (err) {
      console.error("기사 재배정 실패", err);
      alert("재배정에 실패했습니다.");
    }
  };

  if (loading) return <p className="text-center">불러오는 중...</p>;
  if (!detail) return <p className="text-center text-red-500">데이터 없음</p>;

  const { assignmentStatus, rejectionReason } = detail;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">요청 상세 정보</h2>

      <DetailRow label="접수번호" value={detail.requestNo} />

      {/* 고객명 + 자동완성 */}
      <div className="mb-3 relative">
        <strong className="inline-block w-32">고객명</strong>
        <input
          type="text"
          value={customerName}
          onChange={handleCustomerChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="border p-2 rounded w-64"
          placeholder="고객명을 입력하세요"
          autoComplete="off"
        />
        {showSuggestions && (
          <ul className="absolute bg-white border rounded w-64 mt-1 z-10 max-h-48 overflow-auto shadow">
            {loadingSuggest && (
              <li className="p-2 text-gray-500">불러오는 중…</li>
            )}
            {!loadingSuggest && suggestions.length === 0 && (
              <li className="p-2 text-gray-500">검색 결과 없음</li>
            )}
            {suggestions.map((s) => (
              <li
                key={s.customerId}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => handleSelectCustomer(s)}
                title={`${s.name} ${s.phone ?? ""}`}
              >
                {s.name} {s.phone ? `(${s.phone})` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      <DetailRow label="제품명" value={detail.productName} />
      <DetailRow label="제품고유번호" value={detail.serialNumber} />
      <DetailRow label="브랜드" value={detail.productBrand} />
      <DetailRow label="모델명" value={detail.modelCode} />
      <DetailRow label="접수 담당자" value={detail.receiverName} />
      <DetailRow label="수리 담당자" value={detail.engineerName} />
      <DetailRow label="접수일자" value={formatDate(detail.createdAt)} />
      <DetailRow label="AS 요청 상태" value={detail.status} />
      <DetailRow label="접수 상태" value={assignmentStatus} />
      <DetailRow label="요청 내용" value={detail.content} isLong />

      {assignmentStatus === "REJECTED" && rejectionReason && (
        <DetailRow label="거절 사유" value={rejectionReason} isLong />
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="flex gap-4">
          {assignmentStatus === "PENDING" && role === "ENGINEER" && (
            <>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={() => updateAssignmentStatus(id, "ACCEPTED")}
              >
                접수 확인
              </button>

              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => setShowRejectModal(true)}
              >
                접수 불가
              </button>
            </>
          )}

          {["REJECTED", "CANCELLED", "EXPIRED"].includes(assignmentStatus) &&
            (role === "ADMIN" || role === "STAFF") && (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleReassign}
              >
                담당자 재배정
              </button>
            )}
        </div>

        <div className="flex gap-2">
          {(assignmentStatus === "PENDING" ||
            assignmentStatus === "REJECTED") &&
            (role === "ADMIN" || role === "STAFF") && (
              <>
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                  onClick={() => navigate(`/request/edit/${id}`)}
                >
                  수정
                </button>

                <button
                  className="px-4 py-2 bg-gray-700 text-white rounded"
                  onClick={async () => {
                    const confirmDelete =
                      window.confirm("정말 삭제하시겠습니까?");
                    if (confirmDelete) {
                      try {
                        await axios.delete(`/api/requests/${id}`);
                        alert("삭제되었습니다.");
                        navigate("/request/list");
                      } catch (err) {
                        console.error("삭제 실패", err);
                        alert("삭제에 실패했습니다.");
                      }
                    }
                  }}
                >
                  삭제
                </button>
              </>
            )}

          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => navigate("/request/list")}
          >
            목록
          </button>
        </div>
      </div>

      {/* ❗️거절 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h3 className="text-lg font-semibold mb-4">거절 사유 입력</h3>
            <textarea
              className="w-full h-24 border p-2 rounded"
              placeholder="거절 사유를 입력하세요"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
              >
                취소
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => {
                  if (rejectReason.trim()) {
                    updateAssignmentStatus(id, "REJECTED", rejectReason);
                  } else {
                    alert("거절 사유를 입력해주세요.");
                  }
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 재배정 모달 */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h3 className="text-lg font-semibold mb-4">기사 재배정</h3>
            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="새 기사 ID를 입력하세요"
              value={selectedEngineerId}
              onChange={(e) => setSelectedEngineerId(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedEngineerId("");
                }}
              >
                취소
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={reassignEngineer}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, isLong = false }) {
  return (
    <div className="mb-3">
      <strong className="inline-block w-32">{label}</strong>
      <span
        className={isLong ? "block mt-1 border p-2 rounded bg-gray-50" : ""}
      >
        {value}
      </span>
    </div>
  );
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
