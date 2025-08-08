import React, { useState, useEffect, useRef } from 'react';
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

  const [message, setMessage] = useState({
    type: '',
    text: ''
  });

  const submittingRef = useRef(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      if (response && response.status === 200) {
        const data = Array.isArray(response.data) ? response.data : [];
        // 부모 → 자식 정렬
        const sorted = [...data].sort((a, b) => {
          if (!a.parentId && !b.parentId) return 0;
          if (!a.parentId) return -1;
          if (!b.parentId) return 1;
          return a.parentId - b.parentId;
        });
        setCategories(sorted);
      } else {
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const setError = (text) => setMessage({ type: 'error', text });
  const setSuccess = (text) => setMessage({ type: 'success', text });

  const handleSubmit = async () => {
    if (loading || submittingRef.current) return;

    setMessage({ type: '', text: '' });

    if (!formData.categoryId || !formData.name || !formData.description || !formData.cost) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    const categoryIdNum = parseInt(formData.categoryId, 10);
    const costNum = parseInt(formData.cost, 10);
    if (Number.isNaN(categoryIdNum)) {
      setError('카테고리를 선택해주세요.');
      return;
    }
    if (Number.isNaN(costNum)) {
      setError('비용을 올바르게 입력해주세요.');
      return;
    }

    const name = formData.name.trim();
    const description = formData.description.trim();
    if (!name) {
      setError('프리셋 이름을 입력해주세요.');
      return;
    }

    try {
      submittingRef.current = true;
      setLoading(true);

      await createRepairPreset({
        categoryId: categoryIdNum,
        name,
        description,
        cost: costNum
      });

      setSuccess('프리셋이 등록되었습니다.');
      setFormData({ categoryId: '', name: '', description: '', cost: '' });
    } catch (error) {
      console.error('프리셋 등록 실패:', error);

      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message;

      if (status === 401 || status === 403) {
        setError('권한이 부족합니다. 관리자 권한/조직 설정을 확인해 주세요.');
      } else if (status === 400) {
        setError(serverMsg || '유효성 검증에 실패했습니다.');
      } else if (status) {
        setError(serverMsg || `프리셋 등록에 실패했습니다. (HTTP ${status})`);
      } else {
        setError(error?.message || '네트워크 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleCancel = () => {
    if (loading) return;
    setMessage({ type: '', text: '' });
    setFormData({ categoryId: '', name: '', description: '', cost: '' });
  };

  return (
    <div className={styles.customerContainer}>
      <SidebarNavigation />

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
            <div className={styles.inputField} style={{ width: '100%' }}>
              <select
                className={styles.inputControl}
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                disabled={loading}
              >
                <option value="">카테고리 선택</option>
                {categories.map((category) => (
                  <option
                    key={category.categoryId}
                    value={String(category.categoryId)}  // 부모도 선택 가능
                    disabled={false}
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
            <div className={styles.inputField} style={{ width: '100%' }}>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="입력"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>설명</h2>
          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ width: '100%' }}>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="입력"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>비용 입력</h2>
          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ width: '300px' }}>
              <input
                type="number"
                className={styles.inputControl}
                placeholder="입력"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                min="0"
                step="1"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {message.text && (
          <div
            style={{
              width: '100%',
              maxWidth: 600,
              margin: '0 auto 12px auto',
              padding: '8px 10px',
              borderRadius: 6,
              border: message.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
              background: message.type === 'error' ? '#fee2e2' : '#dcfce7',
              color: message.type === 'error' ? '#991b1b' : '#166534',
              fontSize: 14,
              textAlign: 'center'
            }}
          >
            {message.text}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={handleCancel} disabled={loading}>
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
