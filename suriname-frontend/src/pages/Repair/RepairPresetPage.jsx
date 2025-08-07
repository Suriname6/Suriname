import React, { useState, useEffect } from 'react';
import SidebarNavigation from '../../components/SidebarNavigation';
import { getCategories } from '../../api/category';
import { createRepairPreset } from '../../api/repairPreset';
import styles from '../../css/Repair/RepairPreset.module.css';

const RepairPresetPage = () => {
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    cost: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 카테고리 로드
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      if (response && response.status === 200) {
        // 카테고리 정렬: 부모 카테고리 먼저, 그 다음 자식 카테고리
        const sortedCategories = response.data.sort((a, b) => {
          if (!a.parentId && !b.parentId) return 0; // 둘 다 부모
          if (!a.parentId) return -1; // a가 부모
          if (!b.parentId) return 1; // b가 부모
          return a.parentId - b.parentId; // 같은 부모의 자식들끼리 정렬
        });
        setCategories(sortedCategories);
      } else {
        // 카테고리 API가 작동하지 않으면 기존 데이터 사용 (계층구조 반영)
        setCategories([
          { categoryId: 100, name: '모바일', parentId: null },
          { categoryId: 101, name: '스마트폰', parentId: 100 },
          { categoryId: 102, name: '태블릿', parentId: 100 },
          { categoryId: 200, name: '가전제품', parentId: null },
          { categoryId: 201, name: '냉장고', parentId: 200 },
          { categoryId: 202, name: '세탁기', parentId: 200 },
          { categoryId: 203, name: '에어컨', parentId: 200 }
        ]);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
      // 실패 시 기존 데이터 사용 (계층구조 반영)
      setCategories([
        { categoryId: 100, name: '모바일', parentId: null },
        { categoryId: 101, name: '스마트폰', parentId: 100 },
        { categoryId: 102, name: '태블릿', parentId: 100 },
        { categoryId: 200, name: '가전제품', parentId: null },
        { categoryId: 201, name: '냉장고', parentId: 200 },
        { categoryId: 202, name: '세탁기', parentId: 200 },
        { categoryId: 203, name: '에어컨', parentId: 200 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // 폼 검증
    if (!formData.categoryId || !formData.name || !formData.description || !formData.cost) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      const presetData = {
        categoryId: parseInt(formData.categoryId),
        name: formData.name,
        description: formData.description,
        cost: parseInt(formData.cost)
      };

      console.log('Creating preset:', presetData);
      console.log('Request payload:', JSON.stringify(presetData, null, 2));
      
      const response = await createRepairPreset(presetData);
      console.log('API Response:', response);
      
      if (response && response.status === 201) {
        alert('프리셋이 성공적으로 등록되었습니다.');
        // 폼 초기화
        setFormData({
          categoryId: '',
          name: '',
          description: '',
          cost: ''
        });
      } else {
        alert('프리셋 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('프리셋 등록 실패:', error);
      alert(`프리셋 등록 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      categoryId: '',
      name: '',
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
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                disabled={loading}
              >
                <option value="">카테고리 선택</option>
                {categories.map(category => (
                  <option 
                    key={category.categoryId} 
                    value={category.parentId ? category.categoryId : ""}
                    disabled={!category.parentId}
                    style={{
                      fontWeight: category.parentId ? 'normal' : 'bold',
                      color: category.parentId ? '#000' : '#666',
                      fontStyle: category.parentId ? 'normal' : 'italic'
                    }}
                  >
                    {category.parentId ? category.name : `--- ${category.name} ---`}
                  </option>
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
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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
          <button className={styles.submitButton} onClick={handleSubmit} disabled={loading}>
            {loading ? '등록 중...' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairPresetPage;