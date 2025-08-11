import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "../../assets/illustration.png";

export default function RepairTechnicianMainPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 샘플 데이터
  const repairData = [
    {
      id: "AWS-250723-001",
      category: "통신용",
      customer: "올드아이폰 Co.",
      serialNumber: "SN-12345",
      repairDate: "2025-07-23",
      status: "진행중",
      handler: "김기사",
      workTime: "2시간",
    },
    {
      id: "AWS-250723-001",
      category: "통신용",
      customer: "올드아이폰 Co.",
      serialNumber: "SN-12345",
      repairDate: "2025-07-23",
      status: "진행중",
      handler: "김기사",
      workTime: "1시간",
    },
    {
      id: "AWS-250723-001",
      category: "통신용",
      customer: "올드아이폰 Co.",
      serialNumber: "SN-12345",
      repairDate: "2025-07-23",
      status: "진행중",
      handler: "김기사",
      workTime: "3시간",
    },
    {
      id: "AWS-250723-001",
      category: "통신용",
      customer: "올드아이폰 Co.",
      serialNumber: "SN-12345",
      repairDate: "2025-07-23",
      status: "진행중",
      handler: "김기사",
      workTime: "1시간",
    },
    {
      id: "AWS-250723-001",
      category: "통신용",
      customer: "올드아이폰 Co.",
      serialNumber: "SN-12345",
      repairDate: "2025-07-23",
      status: "진행중",
      handler: "김기사",
      workTime: "2시간",
    },
  ];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.role !== "ENGINEER") {
      alert("접근 권한이 없습니다.");
      navigate("/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  // 로딩 또는 접근 차단 중
  if (!user) {
    // 데모용으로 임시 사용자 설정
    setUser({ role: "TECHNICIAN", name: "김기사" });
  }

  const handleRepairRegistration = () => {
    console.log("수리 내역 등록 페이지로 이동");
    navigate("/repair/write");
  };

  const handleMissedRepair = () => {
    console.log("누락 수리 처리 페이지로 이동");
    // navigate("/repair/missed");
  };

  const handleWorkManagement = () => {
    console.log("업무량 관리 페이지로 이동");
    // navigate("/repair/workload");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-[170px] p-8">
        {/* 헤더 섹션 */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              수리기사님 환영합니다
            </h1>
            <div className="text-gray-600 bg-blue-50 px-6 py-4 rounded-lg inline-block text-lg">
              오늘 배정된 수리 요청을 확인하고
              <br />
              수리 내역을 등록해 주세요
            </div>
          </div>
          <div className="w-80 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <img
              src={illustration}
              alt="illustration"
              className="h-full object-contain"
            />
          </div>
        </div>

        {/* 통계 카드 섹션 */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
              오늘 수리 요청
            </h3>
            <div className="text-3xl font-semibold text-gray-800 mb-4 text-center">
              3건
            </div>
            <button
              onClick={handleRepairRegistration}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors font-semibold"
            >
              신규 접수 등록
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
              미완성 수리 내역
            </h3>
            <div className="text-3xl font-semibold text-gray-800 mb-4 text-center">
              4건
            </div>
            <button
              onClick={handleMissedRepair}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors font-semibold"
            >
              누락 등록
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
              전체적 업무 대기
            </h3>
            <div className="text-3xl font-semibold text-gray-800 mb-4 text-center">
              1건
            </div>
            <button
              onClick={handleWorkManagement}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors font-semibold"
            >
              업무량 관리
            </button>
          </div>
        </div>

        {/* 수리 목록 테이블 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">내 수리 목록</h2>
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
                    제품고유번호
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    접수일자
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    수리상태
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    작업시간
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    담당기사
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {repairData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.serialNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.repairDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.workTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.handler}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="p-2 text-gray-400 hover:text-gray-600 text-lg"
              >
                ‹
              </button>

              <div className="px-3 py-1 border border-gray-300 bg-white rounded">
                <span className="text-sm text-gray-600">1</span>
              </div>

              <button
                onClick={() => setCurrentPage(2)}
                className={`px-3 py-2 text-sm ${
                  currentPage === 2
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                } rounded`}
              >
                2
              </button>

              <span className="text-gray-400">3</span>

              <button
                onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                className="p-2 text-gray-400 hover:text-gray-600 text-lg"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
