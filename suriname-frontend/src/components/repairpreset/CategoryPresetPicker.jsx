import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FALLBACK_CATEGORIES = [
  { categoryId: 100, name: '모바일', parentId: null },
  { categoryId: 101, name: '스마트폰', parentId: 100 },
  { categoryId: 102, name: '태블릿', parentId: 100 },
  { categoryId: 200, name: '가전제품', parentId: null },
  { categoryId: 201, name: '냉장고', parentId: 200 },
  { categoryId: 202, name: '세탁기', parentId: 200 },
  { categoryId: 203, name: '에어컨', parentId: 200 },
];

function normalizeCategories(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((c) => {
      const categoryId = c.categoryId ?? c.id ?? c.category_id ?? c.categoryID ?? null;
      const parentId   = c.parentId   ?? c.parent_id ?? c.parentCategoryId ?? c.parentID ?? null;
      const name       = c.name ?? c.categoryName ?? c.title ?? '';
      return { categoryId, parentId, name };
    })
    .filter((c) => c.categoryId != null && typeof c.name === 'string');
}

export default function CategoryPresetPicker({ styles, onAdd }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get('/api/categories/visible');
        const ok = res?.data?.status === 200 && Array.isArray(res?.data?.data) && res.data.data.length > 0;
        const list = ok ? res.data.data : FALLBACK_CATEGORIES;
        const normalized = normalizeCategories(list);
        if (mounted) setCategories(normalized);
      } catch {
        const normalized = normalizeCategories(FALLBACK_CATEGORIES);
        if (mounted) setCategories(normalized);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedCategory) { setPresets([]); setSelectedPreset(''); return; }
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`/api/repair-presets/category/${selectedCategory}/active`);
        let data = res.data;
        if (data?.data) data = data.data;
        else if (data?.content) data = data.content;
        if (mounted) setPresets(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setPresets([]);
      }
    })();
    return () => { mounted = false; };
  }, [selectedCategory]);

  const handleApply = () => {
    if (!selectedPreset) return alert('프리셋을 선택해주세요.');
    const preset = presets.find((p) => {
      const ids = [p.repairPresetsId, p.id, p.repairPresetId].filter(Boolean).map(String);
      return ids.includes(String(selectedPreset));
    });
    if (!preset) return alert('프리셋 정보를 찾을 수 없습니다.');

    const newItem = {
      id: `preset_${Date.now()}_${Math.random().toString(36).slice(2,11)}`,
      itemName: preset.name || preset.itemName || preset.presetName,
      description: `프리셋: ${preset.name || preset.itemName || preset.presetName}`,
      cost: preset.cost || preset.price || 0,
      isPreset: true,
      presetId: preset.repairPresetsId || preset.id || preset.repairPresetId,
    };
    onAdd?.(newItem);
    setSelectedPreset('');
  };

  return (
    <div className={styles.sectionContent}>
      <h2 className={styles.sectionTitle}>수리 프리셋 선택</h2>
      <div className={styles.inputGroup}>
        <div className={styles.inputField} style={{ flex: 1 }}>
          <label className={styles.inputLabel}>카테고리 선택</label>
          <select
            className={styles.inputControl}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedPreset('');
            }}
          >
            <option value="">카테고리 선택</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputField} style={{ flex: 1 }}>
          <label className={styles.inputLabel}>프리셋 품목</label>
          <select
            className={styles.inputControl}
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            disabled={!selectedCategory}
          >
            <option value="">프리셋 품목</option>
            {presets.map((p, i) => (
              <option
                key={p.repairPresetsId || p.id || p.repairPresetId || i}
                value={p.repairPresetsId || p.id || p.repairPresetId}
              >
                {(p.name || p.itemName || p.presetName)} ({(p.cost || p.price || 0).toLocaleString()}원)
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputField} style={{ flex: 0.3 }}>
          <label className={styles.inputLabel}>&nbsp;</label>
          <button
            className={styles.applyBtn}
            onClick={handleApply}
            disabled={!selectedPreset}
            style={{
              backgroundColor: selectedPreset ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: selectedPreset ? 'pointer' : 'not-allowed',
            }}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
