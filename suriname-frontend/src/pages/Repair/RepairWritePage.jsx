import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarNavigation from '../../components/SidebarNavigation';
import styles from '../../css/Repair/RepairWrite.module.css';
import { X } from 'lucide-react';
import axios from 'axios';

const RepairWritePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 수정 모드인지 확인 (수리내역에서 클릭해서 온 경우)
  const editMode = location.state?.mode === 'edit';
  const existingQuote = location.state?.quote;
  
  const [formData, setFormData] = useState({
    customerName: '',
    requestNo: '',
    engineerName: '',
    productName: '',
    customerConsent: false,
    statusChange: 'IN_PROGRESS',
    createdDate: new Date().toISOString().split('T')[0]
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  
  const [repairItems, setRepairItems] = useState([]);
  const [directInputItems, setDirectInputItems] = useState([{ id: `initial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, itemName: '', description: '', cost: '', isEditing: true }]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 계산된 금액들
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [actualCost, setActualCost] = useState(0);
  const [isActualCostManuallyEdited, setIsActualCostManuallyEdited] = useState(false);

  const statusOptions = [
    { value: 'IN_PROGRESS', label: '수리중' },
    { value: 'AWAITING_PAYMENT', label: '입금 대기' },
    { value: 'READY_FOR_DELIVERY', label: '배송 대기' },
    { value: 'COMPLETED', label: '완료' }
  ];

  // 컴포넌트 마운트 시 카테고리 로드
  useEffect(() => {
    loadCategories();
  }, []);

  // 수정 모드인 경우 기존 견적서 데이터로 폼 채우기
  useEffect(() => {
    if (editMode && existingQuote) {
      console.log('=== 수정 모드로 기존 견적서 데이터 로드 ===');
      console.log('전체 견적서 데이터:', existingQuote);
      console.log('cost 필드 값:', existingQuote.cost, '타입:', typeof existingQuote.cost);
      console.log('actualCost 필드 값:', existingQuote.actualCost, '타입:', typeof existingQuote.actualCost);
      
      // 기본 정보 설정 - 담당자 미지정인 경우 확실히 비우기
      const engineerName = existingQuote.employeeName;
      console.log('기존 수리기사명:', engineerName, '타입:', typeof engineerName);
      
      // "담당자 미지정", "미지정", null, undefined, 빈 문자열 모두 처리
      const shouldClearEngineer = !engineerName || 
                                 engineerName.trim() === '' ||
                                 engineerName.includes('담당자 미지정') ||
                                 engineerName.includes('미지정') ||
                                 engineerName === 'null' ||
                                 engineerName === 'undefined';
      
      setFormData({
        customerName: existingQuote.customerName || '',
        requestNo: existingQuote.requestNo || '',
        engineerName: shouldClearEngineer ? '' : engineerName,
        productName: existingQuote.productName || '',
        customerConsent: existingQuote.isApproved || false,
        statusChange: 'IN_PROGRESS', // 기본값
        createdDate: existingQuote.createdAt ? existingQuote.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
      });
      
      // 견적 금액 설정 - 일단 실제 수리비용만 설정하고, 수리항목 파싱 후에 Manual 플래그 설정
      if (existingQuote.cost !== undefined && existingQuote.cost !== null) {
        // 실제 수리비용은 DB에서 불러온 값 사용 (0원도 유효한 값)
        setActualCost(existingQuote.cost);
        console.log('DB에서 불러온 실제 수리비용:', existingQuote.cost);
        // 예상 총 견적금액은 수리항목들이 파싱된 후 자동으로 계산됨 (estimatedCost는 여기서 설정하지 않음)
      }
      
      // field 정보에서 수리항목들을 파싱해서 복원
      if (existingQuote.field) {
        try {
          const fieldLines = existingQuote.field.split('\n');
          
          // 예상견적 정보 추출
          const estimatedLine = fieldLines.find(line => line.startsWith('예상견적: '));
          if (estimatedLine) {
            const estimatedMatch = estimatedLine.match(/예상견적: (\d+)원/);
            if (estimatedMatch) {
              // 예상견적은 파싱된 값으로 일단 설정하지만, useEffect에서 수리항목 합계로 재계산됨
              console.log('field에서 파싱된 예상견적:', parseInt(estimatedMatch[1]));
            }
          }
          
          // 수리항목들을 추출
          const repairItemLines = fieldLines.filter(line => line.startsWith('- '));
          const parsedItems = repairItemLines.map((line, index) => {
            const match = line.match(/^- (.+?): (.+?) \((\d+)원\)$/);
            if (match) {
              return {
                id: `parsed_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
                itemName: match[1],
                description: match[2],
                cost: parseInt(match[3]),
                isPreset: false
              };
            }
            return null;
          }).filter(item => item !== null);
          
          if (parsedItems.length > 0) {
            setDirectInputItems([...parsedItems.map(item => ({ ...item, isEditing: false })), 
                                { id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, itemName: '', description: '', cost: '', isEditing: true }]);
          }
        } catch (error) {
          console.error('견적서 데이터 파싱 실패:', error);
        }
      }
      
      // 기존 견적서 로드 완료 후 자동 동기화를 중단하지 않음
      // 사용자가 직접 실제 수리비용 필드를 수정할 때만 isActualCostManuallyEdited가 true가 됨
      console.log('견적서 데이터 로드 완료, 실제 수리비용 자동 동기화는 유지됨');
      
      // 기존 이미지 로드
      if (existingQuote.requestId) {
        console.log('기존 이미지 로드 시도:', existingQuote.requestId);
        loadExistingImages(existingQuote.requestId);
      } else {
        console.warn('Quote에서 requestId를 찾을 수 없습니다:', existingQuote);
      }
    }
  }, [editMode, existingQuote]);

  // 수리 항목과 직접 입력 항목이 변경될 때 예상 금액 계산 (실시간)
  useEffect(() => {
    // 프리셋으로 추가된 수리항목 합계
    const repairTotal = repairItems.reduce((sum, item) => {
      const cost = parseInt(item.cost || 0);
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);
    
    // 직접 입력 항목 합계 (편집 완료된 항목만 포함)
    const directTotal = directInputItems
      .filter(item => !item.isEditing && item.cost && item.cost !== '')
      .reduce((sum, item) => {
        const cost = parseInt(item.cost || 0);
        return sum + (isNaN(cost) ? 0 : cost);
      }, 0);
    
    const total = repairTotal + directTotal;
    
    console.log('예상 금액 계산:', { repairTotal, directTotal, total });
    
    // 예상 총 견적금액은 항상 자동 계산
    setEstimatedCost(total);
    
    // 실제 수리비용은 사용자가 직접 입력하지 않은 경우에만 동기화
    if (!isActualCostManuallyEdited) {
      setActualCost(total);
      console.log('실제 수리비용 자동 업데이트:', total);
    } else {
      console.log('실제 수리비용은 사용자가 직접 입력했으므로 업데이트 안함');
    }
  }, [repairItems, directInputItems, isActualCostManuallyEdited]);

  // 카테고리가 변경될 때 프리셋 로드
  useEffect(() => {
    if (selectedCategory) {
      loadPresets(selectedCategory);
    } else {
      setPresets([]);
      setSelectedPreset('');
    }
  }, [selectedCategory]);

  // 프리셋이 선택될 때는 자동 추가하지 않고 적용 버튼으로 처리

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories/visible');
      if (response.data.status === 200) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    }
  };

  const loadPresets = async (categoryId) => {
    try {
      const response = await axios.get(`/api/repair-presets/category/${categoryId}/active`);
      console.log('프리셋 응답 데이터:', response.data);
      
      // 응답 구조에 따라 데이터 추출
      let presetsData = response.data;
      if (response.data.data) {
        presetsData = response.data.data;
      } else if (response.data.content) {
        presetsData = response.data.content;
      }
      
      console.log('추출된 프리셋 데이터:', presetsData);
      setPresets(Array.isArray(presetsData) ? presetsData : []);
    } catch (error) {
      console.error('프리셋 로드 실패:', error);
      setPresets([]);
    }
  };

  const addPresetToRepairItems = () => {
    console.log('=== 적용 버튼 클릭됨 ===');
    console.log('selectedPreset:', selectedPreset, typeof selectedPreset);
    console.log('presets 배열:', presets);
    console.log('presets 길이:', presets.length);
    
    if (!selectedPreset) {
      alert('프리셋을 선택해주세요.');
      return;
    }
    
    // 선택된 프리셋의 값과 타입 확인
    console.log('검색할 프리셋 ID:', selectedPreset, '(타입:', typeof selectedPreset, ')');
    
    // 각 프리셋의 ID 필드들 확인
    presets.forEach((preset, index) => {
      console.log(`프리셋 ${index}:`, {
        repairPresetsId: preset.repairPresetsId,
        id: preset.id,
        repairPresetId: preset.repairPresetId,
        name: preset.name || preset.itemName || preset.presetName
      });
    });
    
    // 다양한 필드명과 타입으로 프리셋 찾기 시도
    const preset = presets.find(p => {
      const matches = [
        p.repairPresetsId == selectedPreset,
        p.id == selectedPreset,
        p.repairPresetId == selectedPreset,
        p.repairPresetsId === parseInt(selectedPreset),
        p.id === parseInt(selectedPreset),
        p.repairPresetId === parseInt(selectedPreset),
        String(p.repairPresetsId) === String(selectedPreset),
        String(p.id) === String(selectedPreset),
        String(p.repairPresetId) === String(selectedPreset)
      ];
      console.log(`프리셋 ${p.repairPresetsId || p.id} 매칭 시도:`, matches);
      return matches.some(match => match);
    });
    
    console.log('최종 찾은 프리셋:', preset);
    
    if (preset) {
      const newItem = {
        id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        itemName: preset.name || preset.itemName || preset.presetName,
        description: `프리셋: ${preset.name || preset.itemName || preset.presetName}`,
        cost: preset.cost || preset.price || 0,
        isPreset: true,
        presetId: preset.repairPresetsId || preset.id || preset.repairPresetId
      };
      console.log('생성할 새 아이템:', newItem);
      
      setRepairItems(prev => {
        const updated = [...prev, newItem];
        console.log('업데이트된 repairItems:', updated);
        return updated;
      });
      setSelectedPreset(''); // 선택 초기화
    } else {
      console.log('❌ 프리셋을 찾지 못함!');
      console.log('전체 프리셋 목록:', presets);
      alert('프리셋 정보를 찾을 수 없습니다. 콘솔을 확인해주세요.');
    }
  };

  const validateField = async (field, value) => {
    if (!value) return false;

    try {
      let response;
      switch (field) {
        case 'customerName':
          response = await axios.get(`/api/customers/validate/name/${encodeURIComponent(value)}`);
          return response.data;
        case 'engineerName':
          response = await axios.get(`/api/users/validate/name/${encodeURIComponent(value)}`);
          return response.data;
        case 'requestNo':
          response = await axios.get(`/api/requests/validate/requestno/${encodeURIComponent(value)}`);
          return response.data;
        default:
          return true;
      }
    } catch (error) {
      console.error(`${field} 검증 실패:`, error);
      return false;
    }
  };

  const handleInputChange = async (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // 고객 동의 체크박스가 변경될 때 수리기사 필드 처리
      if (field === 'customerConsent') {
        if (!value) {
          // 동의 해제 시 수리기사 필드 초기화
          newData.engineerName = '';
        }
      }
      
      return newData;
    });
    
    // 고객 동의 체크 시 랜덤 수리기사 배정
    if (field === 'customerConsent' && value) {
      try {
        const response = await axios.get('/api/users/engineers?page=0&size=100');
        const engineers = response.data.content || [];
        
        if (engineers.length > 0) {
          const randomEngineer = engineers[Math.floor(Math.random() * engineers.length)];
          setFormData(prev => ({
            ...prev,
            customerConsent: value,
            engineerName: randomEngineer.name
          }));
        } else {
          console.warn('배정 가능한 수리기사가 없습니다.');
        }
      } catch (error) {
        console.error('수리기사 목록 조회 실패:', error);
      }
    }
  };

  const handleDirectInputChange = (id, field, value) => {
    setDirectInputItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addDirectInputItem = () => {
    setDirectInputItems(prev => [
      ...prev,
      { id: `direct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, itemName: '', description: '', cost: '', isEditing: true }
    ]);
  };
  
  const confirmDirectInputItem = (id) => {
    const item = directInputItems.find(i => i.id === id);
    if (item && item.itemName && item.description && item.cost) {
      setDirectInputItems(prev => 
        prev.map(i => 
          i.id === id ? { ...i, isEditing: false } : i
        )
      );
    }
  };
  
  const removeDirectInputItem = (id) => {
    setDirectInputItems(prev => prev.filter(item => item.id !== id));
  };

  const removeRepairItem = (id) => {
    setRepairItems(prev => prev.filter(item => item.id !== id));
  };

  const loadExistingImages = async (requestId) => {
    try {
      const response = await axios.get(`/api/images/request/${requestId}`);
      if (response.data.status === 200) {
        setUploadedImages(response.data.data);
        console.log('기존 이미지 로드 완료:', response.data.data.length, '개');
      }
    } catch (error) {
      console.error('기존 이미지 로드 실패:', error);
    }
  };

  const uploadTempImages = async (requestNo) => {
    const tempImages = uploadedImages.filter(img => img.file);
    
    if (tempImages.length === 0) {
      return;
    }

    try {
      // Request ID 조회
      const requestResponse = await axios.get(`/api/requests/requestid/${encodeURIComponent(requestNo)}`);
      if (requestResponse.data.status !== 200) {
        throw new Error('Request ID를 찾을 수 없습니다.');
      }

      const requestId = requestResponse.data.data.requestId;
      console.log('Request ID 조회 성공:', requestId);
      
      const successfulUploads = [];
      
      // 각 임시 이미지를 실제로 S3에 업로드
      for (const tempImage of tempImages) {
        try {
          const formData = new FormData();
          formData.append('file', tempImage.file);
          
          const uploadResponse = await axios.post(`/api/images/upload/${requestId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          if (uploadResponse.data.status === 201) {
            successfulUploads.push(uploadResponse.data.data.imageId);
            console.log('이미지 업로드 성공:', tempImage.fileName, '-> imageId:', uploadResponse.data.data.imageId);
          }
        } catch (error) {
          console.error(`이미지 업로드 실패: ${tempImage.fileName}`, error);
        }
      }
      
      // 성공적으로 업로드된 이미지들만 제거하고 메모리 정리
      setUploadedImages(prev => prev.filter(img => !img.file));
      
      // 메모리 정리
      tempImages.forEach(img => {
        if (img.url) {
          URL.revokeObjectURL(img.url);
        }
      });
      
      console.log('임시 이미지 업로드 완료:', successfulUploads.length, '/', tempImages.length, '성공');

    } catch (error) {
      console.error('임시 이미지 업로드 처리 실패:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    // 이미지 파일만 처리
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // Request ID가 있어야만 실제 업로드 가능
    if (editMode && existingQuote?.requestId) {
      // 수정 모드: 실제 업로드
      setUploading(true);
      try {
        const requestId = existingQuote.requestId;
        const successfulUploads = [];
        
        for (const file of imageFiles) {
          if (file.size > 10 * 1024 * 1024) {
            alert(`${file.name}의 크기가 10MB를 초과합니다.`);
            continue;
          }
          
          try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await axios.post(`/api/images/upload/${requestId}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            
            if (response.data.status === 201) {
              // 업로드된 이미지 목록 새로고침
              const imageResponse = await axios.get(`/api/images/request/${requestId}`);
              if (imageResponse.data.status === 200) {
                const newImage = imageResponse.data.data.find(img => img.imageId === response.data.data.imageId);
                if (newImage) {
                  successfulUploads.push(newImage);
                }
              }
            }
          } catch (error) {
            console.error(`파일 업로드 실패: ${file.name}`, error);
            alert(`${file.name} 업로드에 실패했습니다.`);
          }
        }
        
        if (successfulUploads.length > 0) {
          setUploadedImages(prev => [...prev, ...successfulUploads]);
          alert(`${successfulUploads.length}개의 이미지가 성공적으로 업로드되었습니다.`);
        }
        
      } catch (error) {
        console.error('파일 업로드 처리 실패:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
      } finally {
        setUploading(false);
        event.target.value = '';
      }
    } else {
      // 신규 작성 모드: 임시 저장 (견적서 저장 후 실제 업로드)
      setUploading(true);
      try {
        const uploadedFiles = [];
        
        for (const file of imageFiles) {
          if (file.size > 10 * 1024 * 1024) {
            alert(`${file.name}의 크기가 10MB를 초과합니다.`);
            continue;
          }

          // 임시로 파일 정보를 저장 (견적서 저장 후 실제 업로드)
          const tempFileInfo = {
            id: Date.now() + Math.random(),
            imageId: Date.now() + Math.random(),
            fileName: file.name,
            name: file.name,
            file: file, // 실제 파일 객체 저장
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file) // 미리보기용 URL
          };
          
          uploadedFiles.push(tempFileInfo);
        }
        
        setUploadedImages(prev => [...prev, ...uploadedFiles]);
        
        if (uploadedFiles.length > 0) {
          alert(`${uploadedFiles.length}개의 이미지가 선택되었습니다. 견적서 저장 시 업로드됩니다.`);
        }
      } catch (error) {
        console.error('파일 처리 실패:', error);
        alert('파일 처리 중 오류가 발생했습니다.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('이미지를 삭제하시겠습니까?')) {
      return;
    }

    const imageToRemove = uploadedImages.find(img => img.imageId === imageId || img.id === imageId);
    
    if (imageToRemove && imageToRemove.imageId && !imageToRemove.file) {
      // 실제 업로드된 이미지 - S3에서 삭제
      try {
        const response = await axios.delete(`/api/images/${imageToRemove.imageId}`);
        if (response.data.status === 200) {
          setUploadedImages(prev => prev.filter(img => img.imageId !== imageId));
          alert('이미지가 삭제되었습니다.');
        }
      } catch (error) {
        console.error('이미지 삭제 실패:', error);
        alert('이미지 삭제에 실패했습니다.');
      }
    } else {
      // 임시 파일 - 로컬에서만 제거
      setUploadedImages(prev => {
        const tempImage = prev.find(img => img.imageId === imageId || img.id === imageId);
        if (tempImage && tempImage.url) {
          // 메모리 해제를 위해 Blob URL 정리
          URL.revokeObjectURL(tempImage.url);
        }
        return prev.filter(img => img.imageId !== imageId && img.id !== imageId);
      });
    }
  };

  const handleSubmit = async () => {
    // 폼 검증
    const requiredFields = ['customerName', 'requestNo', 'productName'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`${field === 'customerName' ? '고객명' : field === 'requestNo' ? '접수번호' : '제품명'}을 입력해주세요.`);
        return;
      }
    }

    // 고객 동의가 체크되어 있지만 수리기사가 없는 경우 경고
    if (formData.customerConsent && !formData.engineerName.trim()) {
      if (!confirm('수리기사가 지정되지 않았습니다. 자동으로 배정하시겠습니까?')) {
        return;
      }
    }

    // DB 검증 - 수리기사는 실제 값이 있을 때만 검증
    const hasEngineerName = formData.engineerName && formData.engineerName.trim().length > 0;
    const validations = await Promise.all([
      validateField('customerName', formData.customerName),
      validateField('requestNo', formData.requestNo),
      hasEngineerName ? validateField('engineerName', formData.engineerName.trim()) : true
    ]);

    if (!validations[0]) {
      alert('등록되지 않은 고객명입니다.');
      return;
    }
    if (!validations[1]) {
      alert('존재하지 않는 접수번호입니다.');
      return;
    }
    if (hasEngineerName && !validations[2]) {
      alert('등록되지 않은 수리기사입니다.');
      return;
    }

    const allRepairItems = [...repairItems, ...directInputItems.filter(item => !item.isEditing && item.itemName)];
    if (allRepairItems.length === 0) {
      alert('최소 하나의 수리 항목을 추가해주세요.');
      return;
    }

    // 견적서 생성 또는 수정 API 호출
    try {
      // 수리기사명 처리 - 빈 문자열이나 공백은 null로 변환
      const cleanEngineerName = formData.engineerName && formData.engineerName.trim() 
        ? formData.engineerName.trim() 
        : null;
        
      const quoteData = {
        customerName: formData.customerName,
        requestNo: formData.requestNo,
        engineerName: formData.customerConsent ? cleanEngineerName : null,
        productName: formData.productName,
        customerConsent: formData.customerConsent,
        estimatedCost: estimatedCost,
        actualCost: actualCost,
        statusChange: formData.statusChange,
        repairItems: [
          ...repairItems.map(item => ({
            itemName: item.itemName,
            description: item.description,
            cost: parseInt(item.cost) || 0,
            presetId: item.presetId || null
          })),
          ...directInputItems
            .filter(item => !item.isEditing && item.itemName)
            .map(item => ({
              itemName: item.itemName,
              description: item.description,
              cost: parseInt(item.cost || 0),
              presetId: null
            }))
        ]
      };

      let response;
      if (editMode && existingQuote) {
        // 수정 모드일 때는 일반 POST로 새 견적서 생성 후 기존 것을 삭제하는 방식
        console.log('수정 모드 - 신규 생성 + 기존 삭제 방식으로 처리');
        console.log('전송할 데이터:', quoteData);
        
        try {
          // 1. 새로운 견적서 생성
          const createResponse = await axios.post('/api/quotes', quoteData);
          
          if (createResponse.data.status === 201) {
            console.log('새 견적서 생성 성공, 기존 견적서 삭제 시도');
            
            // 2. 기존 견적서 삭제 시도 (실패해도 진행)
            try {
              await axios.delete(`/api/quotes/${existingQuote.quoteId}`);
              console.log('기존 견적서 삭제 완료');
            } catch (deleteError) {
              console.warn('기존 견적서 삭제 실패 (무시):', deleteError);
            }
            
            response = createResponse;
          } else {
            throw new Error('견적서 생성 실패');
          }
        } catch (error) {
          console.error('수정 처리 실패:', error);
          throw error;
        }
      } else {
        // 생성 모드일 때는 POST 요청
        console.log('생성 모드로 POST 요청 전송');
        response = await axios.post('/api/quotes', quoteData);
      }
      
      if (response.data.status === 200 || response.data.status === 201) {
        // 신규 작성 모드에서 임시 저장된 파일들이 있으면 실제 업로드
        if (!editMode && uploadedImages.some(img => img.file)) {
          await uploadTempImages(formData.requestNo);
        }
        
        alert(editMode ? '견적서가 성공적으로 수정되었습니다.' : '견적서가 성공적으로 생성되었습니다.');
        navigate('/repair/list'); // 견적서 목록으로 이동
      }
    } catch (error) {
      console.error('견적서 저장 실패:', error);
      console.error('오류 상세:', error.response);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.response?.status === 405) {
        alert('서버에서 해당 요청 방식을 지원하지 않습니다. 관리자에게 문의하세요.');
      } else {
        alert('견적서 저장 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCancel = () => {
    if (confirm('작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?')) {
      navigate(-1);
    }
  };

  return (
    <div className={styles.customerContainer}>
      <SidebarNavigation />
      
      {/* 탭 네비게이션 */}
      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          <button className={`${styles.tabButton} ${styles.active}`}>
            {editMode ? '수리 내역 수정' : '수리 내역 작성'}
          </button>
        </div>
      </div>

      <div className={styles.sectionContainer}>
        
        {/* 수리 기사 정보 */}
        <div className={styles.technicianSection}>
          <div className={styles.technicianBox}>
            <span className={styles.technicianLabel}>수리 기사</span>
            <input
              type="text"
              className={styles.technicianName}
              value={formData.engineerName}
              onChange={(e) => handleInputChange('engineerName', e.target.value)}
              placeholder={formData.customerConsent ? "수리기사명 입력 (비워두면 자동 배정)" : "고객 동의 시 수리기사 배정"}
              disabled={!formData.customerConsent}
              style={{
                border: 'none',
                background: formData.customerConsent ? 'white' : '#f5f5f5',
                outline: 'none',
                padding: '4px 8px'
              }}
            />
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
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="고객명을 입력하세요"
              />
            </div>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>제품명</label>
              <input
                type="text"
                className={styles.inputControl}
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="제품명을 자유롭게 입력하세요"
              />
            </div>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>접수번호</label>
              <input
                type="text"
                className={styles.inputControl}
                value={formData.requestNo}
                onChange={(e) => handleInputChange('requestNo', e.target.value)}
                placeholder="접수번호를 입력하세요"
              />
            </div>
          </div>
        </div>

        {/* 수리 프리셋 선택 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>수리 프리셋 선택</h2>
          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>카테고리 선택</label>
              <select 
                className={styles.inputControl}
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">카테고리 선택</option>
                {categories.map(category => {
                  const isParentCategory = category.parent_id === null || category.parentId === null || category.parentCategoryId === null;
                  return (
                    <option 
                      key={category.categoryId} 
                      value={isParentCategory ? "" : category.categoryId}
                      disabled={isParentCategory}
                      style={{ color: isParentCategory ? '#999' : '#000' }}
                    >
                      {isParentCategory ? `---${category.name}---` : category.name}
                    </option>
                  );
                })}
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
                {presets.map((preset, index) => (
                  <option 
                    key={preset.repairPresetsId || preset.id || preset.repairPresetId || index} 
                    value={preset.repairPresetsId || preset.id || preset.repairPresetId}
                  >
                    {(preset.name || preset.itemName || preset.presetName)} ({(preset.cost || preset.price || 0).toLocaleString()}원)
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputField} style={{ flex: 0.3 }}>
              <label className={styles.inputLabel}>&nbsp;</label>
              <button 
                className={styles.applyBtn}
                onClick={addPresetToRepairItems}
                disabled={!selectedPreset}
                style={{
                  backgroundColor: selectedPreset ? '#007bff' : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: selectedPreset ? 'pointer' : 'not-allowed'
                }}
              >
                적용
              </button>
            </div>
          </div>
        </div>

        {/* 수리 항목 테이블 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>수리 항목</h2>
          <div className={styles.repairTable}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>수리 항목명</div>
              <div className={styles.headerCell}>설명</div>
              <div className={styles.headerCell}>비용</div>
              <div className={styles.headerCell}>삭제</div>
            </div>
            
            {/* 프리셋으로 추가된 항목들 */}
            {repairItems.map(item => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{item.itemName}</div>
                <div className={styles.tableCell}>{item.description}</div>
                <div className={styles.tableCell}>{item.cost?.toLocaleString()}원</div>
                <div className={styles.tableCell}>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => removeRepairItem(item.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* 직접 입력 항목들 */}
            {directInputItems.map((item, index) => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  {item.isEditing ? (
                    <input
                      className={styles.tableInput}
                      type="text"
                      placeholder="항목명 입력"
                      value={item.itemName}
                      onChange={(e) => handleDirectInputChange(item.id, 'itemName', e.target.value)}
                    />
                  ) : (
                    item.itemName
                  )}
                </div>
                <div className={styles.tableCell}>
                  {item.isEditing ? (
                    <input
                      className={styles.tableInput}
                      type="text"
                      placeholder="설명 입력"
                      value={item.description}
                      onChange={(e) => handleDirectInputChange(item.id, 'description', e.target.value)}
                    />
                  ) : (
                    item.description
                  )}
                </div>
                <div className={styles.tableCell}>
                  {item.isEditing ? (
                    <input
                      className={styles.tableInput}
                      type="number"
                      placeholder="비용 입력"
                      value={item.cost}
                      onChange={(e) => handleDirectInputChange(item.id, 'cost', e.target.value)}
                    />
                  ) : (
                    `${parseInt(item.cost || 0).toLocaleString()}원`
                  )}
                </div>
                <div className={styles.tableCell}>
                  {index === directInputItems.length - 1 ? (
                    <button 
                      className={styles.addBtn}
                      onClick={() => {
                        if (item.isEditing) {
                          if (item.itemName && item.description && item.cost) {
                            confirmDirectInputItem(item.id);
                            addDirectInputItem();
                          } else {
                            alert('모든 필드를 입력해주세요.');
                          }
                        } else {
                          addDirectInputItem();
                        }
                      }}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  ) : (
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => removeDirectInputItem(item.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 견적서 정보 입력 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>견적서 정보 입력</h2>
          <div className={styles.estimateGrid}>
            <div className={styles.estimateField}>
              <label className={styles.fieldLabel}>예상 총 견적금액</label>
              <input
                className={styles.fieldInput}
                type="text"
                value={estimatedCost.toLocaleString()}
                readOnly
                style={{ backgroundColor: '#f5f5f5' }}
                placeholder="200,000"
              />
              <small>* 수리 항목 비용의 합계가 자동으로 계산됩니다.</small>
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
                value={actualCost}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 0;
                  setActualCost(newValue);
                  setIsActualCostManuallyEdited(true);
                }}
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
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={styles.agreementSection}>
            <span className={styles.agreementLabel}>고객 동의 여부</span>
            <div className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.customerConsent}
                onChange={(e) => handleInputChange('customerConsent', e.target.checked)}
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
              이미지 파일만 업로드 가능하며, 파일 크기는 10MB 이하로 제한됩니다.
            </p>
            
            <div className={styles.dropZone}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className={styles.fileInput}
                disabled={uploading}
              />
              <div className={styles.dropText}>
                {uploading ? '이미지 업로드 중...' : '파일을 드롭하거나 클릭하여 선택'}
              </div>
              <div className={styles.formatText}>
                형식: JPG, PNG, GIF & 최대 파일 크기: 10MB
              </div>
            </div>
            
            {uploadedImages.length > 0 && (
              <div className={styles.uploadedFiles}>
                <h4>📷 업로드된 이미지 ({uploadedImages.length}장):</h4>
                <div className={styles.imageGallery}>
                  {uploadedImages.map(image => (
                    <div key={image.imageId || image.id} className={styles.imageItem}>
                      <div className={styles.imagePreview}>
                        <img
                          src={image.url || (image.imageId ? `/api/images/view/${image.imageId}` : '')}
                          alt={image.fileName || image.name}
                          className={styles.previewImage}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className={styles.imagePlaceholder} style={{ display: 'none' }}>
                          <span>이미지를 불러올 수 없습니다</span>
                        </div>
                      </div>
                      <div className={styles.imageInfo}>
                        <div className={styles.imageName} title={image.fileName || image.name}>
                          {image.fileName || image.name}
                        </div>
                        <div className={styles.imageSize}>
                          {image.fileSize ? `${(image.fileSize / 1024).toFixed(1)} KB` : 
                           image.size ? `${(image.size / 1024).toFixed(1)} KB` : ''}
                        </div>
                      </div>
                      <button 
                        className={styles.removeImageBtn}
                        onClick={() => handleDeleteImage(image.imageId || image.id)}
                        title="이미지 삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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