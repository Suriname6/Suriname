import React, { useRef } from 'react';

const ExcelUploadBox = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);

      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        border: '2px dashed #93c5fd',
        borderRadius: '8px',
        backgroundColor: '#eff4ff',
        padding: '48px 24px',
        textAlign: 'center',
        marginBottom: '24px',
        cursor: 'pointer'
      }}
    >
      <input
        type="file"
        accept=".xlsx"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div style={{
        width: '48px',
        height: '48px',
        backgroundColor: '#dbeafe',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        fontSize: '24px',
        color: '#2563eb'
      }}>
        ⬆
      </div>
      <div style={{
        fontSize: '18px',
        color: '#374151',
        marginBottom: '8px'
      }}>
        Drop file or Browse
      </div>
      <div style={{
        fontSize: '14px',
        color: '#6b7280'
      }}>
        Format: xlsx & Max file size: 25 MB
      </div>
    </div>
  );
};

export default ExcelUploadBox;
