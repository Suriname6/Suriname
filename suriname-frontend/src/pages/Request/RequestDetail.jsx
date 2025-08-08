import React, { useEffect, useState } from "react";
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

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`/api/requests/${id}`);
                setDetail(res.data);
            } catch (err) {
                console.error("요청 상세 정보 조회 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const updateAssignmentStatus = async (requestId, status, reason = "") => {
        try {
            await axios.put(`/api/requests/${requestId}/assignment-status`, {
                status,
                reason,
            });
            alert("상태가 변경되었습니다.");
            const res = await axios.get(`/api/requests/${id}`);
            setDetail(res.data);
            setShowRejectModal(false); // 모달 닫기
            setRejectReason("");       // 입력 초기화
        } catch (err) {
            console.error("상태 변경 실패", err);
            alert("상태 변경에 실패했습니다.");
        }
    };

    const handleReassign = () => {
        setShowReassignModal(true);
    };

    const reassignEngineer = async () => {
        if (!selectedEngineerId.trim()) {
            alert("기사 ID를 입력해주세요.");
            return;
        }

        try {
            await axios.put(`/api/requests/${id}/assignment-engineer`, {
                employeeId:selectedEngineerId,
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
            <DetailRow label="고객명" value={detail.customerName} />
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
                    {(assignmentStatus === "PENDING" || assignmentStatus === "REJECTED") &&
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
                                    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
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
            <span className={isLong ? "block mt-1 border p-2 rounded bg-gray-50" : ""}>{value}</span>
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
