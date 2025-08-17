import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExcelUploadBox from "../../components/ExcelUploadBox";
import styles from "../../css/Customer/CustomerExcelAdd.module.css";
import api from "../../api/api";

const ProductExcelAdd = () => {
  const [selectedTab, setSelectedTab] = useState("excel");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    if (tab === "general") {
      navigate("/product/register");
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/ProductListTemplate.xlsx";
    link.download = "ProductListTemplate2025.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);

    try {
      const response = await api.post("/api/products/register/excel", formData);
      alert("업로드 성공!");
      console.log(response.data);
    } catch (error) {
      console.error("업로드 실패:", error);
      alert(
        "업로드 실패: " + (error.response?.data?.message || "알 수 없는 오류")
      );
    }
  };

  return (
    <div className={styles.customerContainer}>
      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${
              selectedTab === "general" ? styles.active : styles.inactive
            }`}
            onClick={() => {
              setSelectedTab("general");
              handleTabClick("general");
            }}
          >
            일반 등록
          </button>
          <button
            className={`${styles.tabButton} ${
              selectedTab === "excel" ? styles.active : styles.inactive
            }`}
            onClick={() => setSelectedTab("excel")}
          >
            엑셀 일괄 등록
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className={styles.contentContainer}>
        {/* Template Section */}
        <div className={styles.templateSection}>
          <h2 className={styles.sectionTitle}>파일 양식</h2>
          <p className={styles.sectionDescription}>제품 데이터 작성 양식</p>

          <div className={styles.templateCard}>
            <div className={styles.templateInfo}>
              <div className={styles.templateIcon}>📄</div>
              <span className={styles.templateName}>
                ProductListTemplate 2025.xlsx
              </span>
              <span className={styles.templateBadge}>XLS</span>
            </div>
            <button
              className={styles.downloadButton}
              onClick={downloadTemplate}
            >
              ⬇ 다운로드
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className={styles.uploadSection}>
          <h2 className={styles.sectionTitle}>데이터 삽입</h2>
          <p className={styles.uploadDescription}>
            .xlsx 또는 .xls 형식의 파일만 업로드 가능하며, 25MB 이하로
            제한됩니다.
          </p>

          <ExcelUploadBox
            onFileSelect={(file) => {
              if (file && !uploadedFiles.some((f) => f.name === file.name)) {
                setUploadedFiles((prev) => [...prev, file]);
              }
            }}
          />

          {/* Uploaded Files List */}
          <div className={styles.uploadedFiles}>
            {uploadedFiles.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <div className={styles.fileInfo}>
                  <div className={styles.fileIcon}>📄</div>
                  <span className={styles.fileName}>{file.name}</span>
                </div>
                <button
                  className={styles.removeButton}
                  onClick={() => removeFile(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={() => navigate("/product/list")}
            >
              취소
            </button>
            <button
              className={`${styles.button} ${styles.uploadButton}`}
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

export default ProductExcelAdd;
