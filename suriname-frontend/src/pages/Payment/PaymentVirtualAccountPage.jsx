import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createVirtualAccount } from '../../api/payment';
import axios from '../../api/axiosInstance';
import styles from '../../css/Payment/PaymentVirtualAccount.module.css';

const PaymentVirtualAccountPage = () => {
  const [selectedTab, setSelectedTab] = useState("virtual");
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    customerName: '',
    receptionNumber: '',
    paymentAmount: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error'

  // 수리내역 페이지에서 전달된 데이터로 폼 초기화
  useEffect(() => {
    if (location.state) {
      const { customerName, requestNo, paymentAmount } = location.state;
      setFormData({
        customerName: customerName || '',
        receptionNumber: requestNo || '',
        paymentAmount: paymentAmount ? paymentAmount.toLocaleString() : ''
      });
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabClick = (tab) => {
    if (tab === "list") {
      navigate("/payment/list");
    }
  };

  const handleCancel = () => {
    setFormData({
      customerName: '',
      receptionNumber: '',
      paymentAmount: ''
    });
  };

  const handleRequest = async () => {
    // 폼 검증
    if (!formData.customerName || !formData.receptionNumber || !formData.paymentAmount) {
      setMessage('모든 필드를 입력해주세요.');
      setMessageType('error');
      return;
    }

    // 결제 금액 숫자 검증
    const amount = parseInt(formData.paymentAmount.replace(/[,\s]/g, ''));
    if (isNaN(amount) || amount <= 0) {
      setMessage('올바른 결제 금액을 입력해주세요.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // 요청 데이터 준비
      const requestData = {
        requestNo: formData.receptionNumber, // 접수번호로 요청 찾기
        merchantUid: `VIR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        vbankHolder: formData.customerName,
        vbankDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7일 후
      };

      console.log('가상계좌 발급 요청:', requestData);

      const response = await createVirtualAccount(requestData);
      
      // 성공 메시지 표시 후 입금상태 목록으로 리다이렉트
      setMessage(`가상계좌가 발급되었습니다.\n은행: ${response.bankName || '가상계좌은행'}\n계좌번호: ${response.accountNumber || '가상계좌번호'}\n마감일: ${response.dueDate || '7일 후'}`);
      setMessageType('success');

      // 가상계좌 발급 성공 시 Request 상태를 입금대기로 업데이트
      try {
        const statusUpdateResponse = await axios.put(`/api/requests/${formData.receptionNumber}/status`, {
          status: 'AWAITING_PAYMENT'
        });
        
        if (statusUpdateResponse.data.status === 200) {
          console.log('Request 상태가 입금대기로 업데이트되었습니다.');
        }
      } catch (statusError) {
        console.warn('Request 상태 업데이트 실패 (무시됨):', statusError);
        // 상태 업데이트 실패해도 전체 프로세스는 계속 진행
      }

      // 2초 후 입금상태 목록으로 이동
      setTimeout(() => {
        navigate('/payment/list');
      }, 2000);

    } catch (error) {
      console.error('가상계좌 발급 실패:', error);
      setMessage(error.response?.data?.message || '가상계좌 발급에 실패했습니다.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.customerContainer}>
      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${
              selectedTab === "virtual" ? styles.active : styles.inactive
            }`}
            onClick={() => {
              setSelectedTab("virtual");
              handleTabClick("virtual");
            }}
          >
            가상계좌 발급 요청
          </button>

        </div>
      </div>

      <div className={styles.sectionContainer}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>가상계좌 정보</h2>
          {message && (
            <div className={`${styles.message} ${styles[messageType]}`}>
              {message.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}

          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>
                고객명
              </label>
              <input
                type="text"
                name="customerName"
                className={styles.inputControl}
                placeholder="박길동"
                value={formData.customerName}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>
                접수번호
              </label>
              <input
                type="text"
                name="receptionNumber"
                className={styles.inputControl}
                placeholder="AS-250723-001"
                value={formData.receptionNumber}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ width: "100%" }}>
              <label className={styles.inputLabel}>결제 금액</label>
              <input
                type="text"
                name="paymentAmount"
                className={styles.inputControl}
                placeholder="999,999,999"
                value={formData.paymentAmount}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button 
              className={styles.cancelButton} 
              onClick={handleCancel}
              disabled={loading}
            >
              취소
            </button>
            <button 
              className={styles.submitButton} 
              onClick={handleRequest}
              disabled={loading}
            >
              {loading ? '처리중...' : '요청'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVirtualAccountPage;