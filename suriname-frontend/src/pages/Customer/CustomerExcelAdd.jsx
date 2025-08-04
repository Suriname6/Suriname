import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelUploadBox from '../../components/ExcelUploadBox';
import axios from 'axios';

const CustomerExcelAdd = () => {
  const [selectedTab, setSelectedTab] = useState('excel');
   const navigate = useNavigate();

     const handleTabClick = (tab) => {
    if (tab === 'general') {
      navigate('/customer/upload'); 
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState([
  ]);

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };


const downloadTemplate = () => {
  const link = document.createElement('a');
  link.href = '/CustomerListTemplate.xlsx'; 
  link.download = 'CustomerListTemplate2025.xlsx'; 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


const handleUpload = async () => {
  if (uploadedFiles.length === 0) {
    alert('업로드할 파일을 선택해주세요.');
    return;
  }

  const formData = new FormData();
  formData.append('file', uploadedFiles[0]); 

  try {
    const response = await axios.post('/api/customers/upload/excel', formData);
    alert('업로드 성공!');
    console.log(response.data);
  } catch (error) {
    console.error("업로드 실패:", error);
    alert('업로드 실패: ' + (error.response?.data?.message || '알 수 없는 오류'));
  }
};


  return (
    <div style={{
      marginLeft: '200px',
      padding: '32px 24px',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Tab Navigation */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          backgroundColor: '#eff4ff',
          borderRadius: '100px',
          padding: '4px',
          display: 'flex',
          width: '100%',
          maxWidth: '1000px'
        }}>
          <button
            onClick={() => {
                setSelectedTab('general');
            handleTabClick('general');
            }}
            style={{
              flex: 1,
              padding: '16px 24px',
              border: 'none',
              borderRadius: '100px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: selectedTab === 'general' ? '#ffffff' : 'transparent',
              color: selectedTab === 'general' ? '#2563eb' : '#6b7280',
              boxShadow: selectedTab === 'general' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            일반 등록
          </button>
          <button
            onClick={() => {
                setSelectedTab('excel');
            handleTabClick('excel');
            }}
            style={{
              flex: 1,
              padding: '16px 24px',
              border: 'none',
              borderRadius: '100px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: selectedTab === 'excel' ? '#ffffff' : 'transparent',
              color: selectedTab === 'excel' ? '#2563eb' : '#6b7280',
              boxShadow: selectedTab === 'excel' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            액셀 일괄 등록
          </button>
        </div>
      </div>

      {/* Content Container - Centered */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* File Template Section */}
        <div style={{ marginBottom: '48px', width: '100%', maxWidth: '600px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#181d27',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            파일 양식
          </h2>
          <p style={{
            color: '#6c5f6c',
            fontSize: '14px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            고객 데이터 작성 양식
          </p>
          
          <div style={{
            backgroundColor: '#eff4ff',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#ffffff',
                border: '4px solid #dbeafe',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#2563eb'
              }}>
                📄
              </div>
              <span style={{ fontWeight: '500', color: '#03112c' }}>
                CustomerListTemplate 2025.xlsx
              </span>
              <span style={{
                backgroundColor: '#e5e7eb',
                color: '#6b7280',
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                XLS
              </span>
            </div>
            <button
              onClick={downloadTemplate}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              ⬇ 다운로드
            </button>
          </div>
        </div>

        {/* Data Upload Section */}
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#181d27',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            데이터 삽입
          </h2>
          <p style={{
            color: '#6c5f6c',
            fontSize: '14px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Please upload files in pdf, docx or doc format and make sure the file size is under 25 MB.
          </p>

          
<ExcelUploadBox onFileSelect={(file) => {
  if (file && !uploadedFiles.some(f => f.name === file.name)) {
    setUploadedFiles(prev => [...prev, file]);
  }
}} />
          {/* Uploaded Files */}
          <div style={{ marginBottom: '32px' }}>
            {uploadedFiles.map((file, index) => (
              <div key={index} style={{
                backgroundColor: '#eff4ff',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#2563eb',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px'
                  }}>
                    📄
                  </div>
                  <span style={{ color: '#03112c', fontWeight: '500' }}>
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#fee2e2'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Action Buttons - Right Aligned */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'flex-end' 
          }}>
            <button style={{
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: 'transparent',
              border: '1px solid #d1d5db',
              color: '#374151'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              취소
            </button>
            <button style={{
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: '#2563eb',
              border: '1px solid #2563eb',
              color: 'white'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
             onClick={handleUpload}
            >
              업로드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerExcelAdd;