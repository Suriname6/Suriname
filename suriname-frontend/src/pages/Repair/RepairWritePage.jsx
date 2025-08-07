import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarNavigation from '../../components/SidebarNavigation';
import styles from '../../css/Repair/RepairWrite.module.css';
import { X } from 'lucide-react';

const RepairWritePage = () => {
  const location = useLocation();
  const quoteData = location.state?.quote || null;
  const mode = location.state?.mode || 'new';
  
  const [formData, setFormData] = useState({
    customerName: quoteData?.customerName || '홍길동',
    productName: quoteData?.productName || '울트라북 G14',
    serialNumber: quoteData?.requestNo || 'AWS-250723-001',
    repairTechnician: quoteData?.employeeName || '정동길',
    issueCategory: '',
    priceCategory: '',
    estimatedAmount: quoteData?.cost || '',
    createdDate: quoteData?.createdAt ? new Date(quoteData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    actualRepairCost: '',
    statusChange: '수리중',
    customerAgreement: false
  });

  const [repairItems, setRepairItems] = useState([
    { id: 1, category: '메인 보드 교체', description: '직접 불량 수리', price: 120000 },
    { id: 2, category: '화면 교체', description: '액정 파손', price: 80000 }
  ]);

  const [newItem, setNewItem] = useState({ category: '', description: '', price: '' });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const issueCategories = [
    '키패드의 신호',
    '프리즈 문제',
    '화면 문제',
    '배터리 문제',
    '기타'
  ];

  const priceCategories = [
    '프리즈 문제',
    '화면 문제',
    '배터리 문제',
    '기타'
  ];

  const statusOptions = [
    '수리중',
    '입금 대기',
    '완료'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewItemChange = (field, value) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRepairItem = () => {
    if (newItem.category && newItem.description && newItem.price) {
      setRepairItems(prev => [
        ...prev,
        {
          id: Date.now(),
          category: newItem.category,
          description: newItem.description,
          price: parseInt(newItem.price)
        }
      ]);
      setNewItem({ category: '', description: '', price: '' });
    }
  };

  const removeRepairItem = (id) => {
    setRepairItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file.size <= 25 * 1024 * 1024) { // 25MB 제한
        setUploadedFiles(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          file: file
        }]);
      } else {
        alert('파일 크기가 25MB를 초과합니다.');
      }
    });
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleSubmit = () => {
    // 폼 검증
    if (!formData.issueCategory || !formData.priceCategory) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (repairItems.length === 0) {
      alert('최소 하나의 수리 항목을 추가해주세요.');
      return;
    }

    // API 호출 로직
    console.log('Form submitted:', {
      ...formData,
      repairItems,
      uploadedFiles
    });
    
    alert('수리 내역이 저장되었습니다.');
  };

  const handleCancel = () => {
    if (confirm('작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?')) {
      // 이전 페이지로 이동 또는 목록으로 이동
      window.history.back();
    }
  };

  return (
    <div className={styles.customerContainer}>
      <SidebarNavigation />
      
      {/* 탭 네비게이션 */}
      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          <button className={`${styles.tabButton} ${styles.active}`}>
            수리 내역 작성
          </button>
        </div>
      </div>

      <div className={styles.sectionContainer}>
        
        {/* 수리 기사 정보 */}
        <div className={styles.technicianSection}>
          <div className={styles.technicianBox}>
            <span className={styles.technicianLabel}>수리 기사</span>
            <span className={styles.technicianName}>{formData.repairTechnician}</span>
          </div>
        </div>

        {/* 고객 정보 */}
        <div className={styles.sectionContent}>
          
          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>고객명</label>
              <input
                type="text"
                className={styles.inputControl}
                value={formData.customerName}
                readOnly
              />
            </div>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>제품명</label>
              <input
                type="text"
                className={styles.inputControl}
                value={formData.productName}
                readOnly
              />
            </div>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>접수번호</label>
              <input
                type="text"
                className={styles.inputControl}
                value={formData.serialNumber}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* 수리 프리셋 선택 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>수리 프리셋 선택</h2>
          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>키패드의 신호</label>
              <select 
                className={styles.inputControl}
                value={formData.issueCategory} 
                onChange={(e) => handleInputChange('issueCategory', e.target.value)}
              >
                <option value="">카테고리 선택</option>
                {issueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>프리셋 품목</label>
              <select 
                className={styles.inputControl}
                value={formData.priceCategory} 
                onChange={(e) => handleInputChange('priceCategory', e.target.value)}
              >
                <option value="">프리셋 품목</option>
                {priceCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 수리 항목 테이블 */}
        <div className={styles.sectionContent}>
          <div className={styles.repairTable}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>수리 항목명</div>
              <div className={styles.headerCell}>설명</div>
              <div className={styles.headerCell}>비용</div>
              <div className={styles.headerCell}>삭제</div>
            </div>
            
            {repairItems.map(item => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{item.category}</div>
                <div className={styles.tableCell}>{item.description}</div>
                <div className={styles.tableCell}>{item.price.toLocaleString()}</div>
                <div className={styles.tableCell}>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => removeRepairItem(item.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* 새 항목 추가 행 */}
            <div className={styles.tableRow}>
              <div className={styles.tableCell}>
                <input
                  className={styles.tableInput}
                  type="text"
                  placeholder="항목 입력"
                  value={newItem.category}
                  onChange={(e) => handleNewItemChange('category', e.target.value)}
                />
              </div>
              <div className={styles.tableCell}>
                <input
                  className={styles.tableInput}
                  type="text"
                  placeholder="설명 입력"
                  value={newItem.description}
                  onChange={(e) => handleNewItemChange('description', e.target.value)}
                />
              </div>
              <div className={styles.tableCell}>
                <input
                  className={styles.tableInput}
                  type="number"
                  placeholder="비용 입력"
                  value={newItem.price}
                  onChange={(e) => handleNewItemChange('price', e.target.value)}
                />
              </div>
              <div className={styles.tableCell}>
                <button className={styles.addBtn} onClick={addRepairItem}>
                  +
                </button>
              </div>
            </div>
          </div>
          
          <button className={styles.addItemBtn}>
            +항목 직접 추가
          </button>
        </div>

        {/* 견적서 정보 입력 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>견적서 정보 입력</h2>
          <div className={styles.estimateGrid}>
            <div className={styles.estimateField}>
              <label className={styles.fieldLabel}>예상 총 견적금액</label>
              <input
                className={styles.fieldInput}
                type="number"
                value={formData.estimatedAmount}
                onChange={(e) => handleInputChange('estimatedAmount', e.target.value)}
                placeholder="200,000"
              />
            </div>
            <div className={styles.estimateField}>
              <label className={styles.fieldLabel}>견적서 생성일</label>
              <input
                className={styles.fieldInput}
                type="date"
                value={formData.createdDate}
                onChange={(e) => handleInputChange('createdDate', e.target.value)}
              />
            </div>
            <div className={styles.estimateField}>
              <label className={styles.fieldLabel}>실제 수리 비용</label>
              <input
                className={styles.fieldInput}
                type="number"
                value={formData.actualRepairCost}
                onChange={(e) => handleInputChange('actualRepairCost', e.target.value)}
                placeholder="180,000"
              />
            </div>
            <div className={styles.estimateField}>
              <label className={styles.fieldLabel}>상태 변경</label>
              <select
                className={styles.fieldInput}
                value={formData.statusChange}
                onChange={(e) => handleInputChange('statusChange', e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={styles.agreementSection}>
            <span className={styles.agreementLabel}>고객 동의 여부</span>
            <div className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.customerAgreement}
                onChange={(e) => handleInputChange('customerAgreement', e.target.checked)}
              />
              <span>동의 받음</span>
            </div>
          </div>
        </div>

        {/* 사진 첨부 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>사진 첨부</h2>
          <div className={styles.fileUpload}>
            <p className={styles.fileInfo}>
              Please upload files in pdf, docx or doc format and make sure the file size is under 25 MB.
            </p>
            
            <div className={styles.dropZone}>
              <input
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.pdf,.docx,.doc"
                onChange={handleFileUpload}
                className={styles.fileInput}
              />
              <div className={styles.dropText}>
                Drop file or Browse
              </div>
              <div className={styles.formatText}>
                Format: png & Max file size: 25 MB
              </div>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className={styles.uploadedFiles}>
                {uploadedFiles.map(file => (
                  <div key={file.id} className={styles.fileItem}>
                    <span className={styles.fileName}>📎 {file.name}</span>
                    <button 
                      className={styles.removeFileBtn}
                      onClick={() => removeFile(file.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className={styles.uploadActions}>
              <button className={styles.uploadBtn}>업로드</button>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={handleCancel}>
            취소
          </button>
          <button className={styles.submitButton} onClick={handleSubmit}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairWritePage;