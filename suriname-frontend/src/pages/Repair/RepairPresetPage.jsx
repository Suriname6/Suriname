import React, { useState } from 'react';
import SidebarNavigation from '../../components/SidebarNavigation';
import styles from '../../css/Repair/RepairPreset.module.css';

const RepairPresetPage = () => {
  const [formData, setFormData] = useState({
    category: '',
    itemName: '',
    description: '',
    cost: ''
  });

  const categories = [
    '카테고리 선택',
    '화면 문제',
    '배터리 문제',
    '기타'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // 폼 검증
    if (!formData.category || !formData.itemName || !formData.description || !formData.cost) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // API 호출 로직
    console.log('Preset submitted:', formData);
    alert('프리셋이 등록되었습니다.');
    
    // 폼 초기화
    setFormData({
      category: '',
      itemName: '',
      description: '',
      cost: ''
    });
  };

  const handleCancel = () => {
    setFormData({
      category: '',
      itemName: '',
      description: '',
      cost: ''
    });
  };

  return (
    <div className={styles.customerContainer}>
      <SidebarNavigation />
      
      {/* 탭 네비게이션 */}
      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          <button className={`${styles.tabButton} ${styles.active}`}>
            프리셋 등록
          </button>
        </div>
      </div>

      <div className={styles.sectionContainer}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>제품 카테고리</h2>
          
          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ width: "100%" }}>
              <select
                className={styles.inputControl}
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>프리셋 이름</h2>
          
          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ width: "100%" }}>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="입력"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>설명</h2>
          
          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ width: "100%" }}>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="입력"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>비용 입력</h2>
          
          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ width: "300px" }}>
              <input
                type="number"
                className={styles.inputControl}
                placeholder="입력"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={handleCancel}>
            취소
          </button>
          <button className={styles.submitButton} onClick={handleSubmit}>
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairPresetPage;