import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExcelUploadBox from "../../components/ExcelUploadBox";
import styles from "../../css/Customer/CustomerExcelAdd.module.css";
import api from "../../api/api";

const CustomerExcelAdd = () => {
  const [selectedTab, setSelectedTab] = useState("excel");
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    if (tab === "general") {
      navigate("/customer/upload");
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/CustomerListTemplate.xlsx";
    link.download = "CustomerListTemplate2025.xlsx";
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
<<<<<<< HEAD
      const response = await axios.post(
        "/api/customers/upload/excel",
        formData
      );
      alert("업로드 성공!");
      console.log(response.data);
=======
      const response = await api.post("/api/customers/upload/excel", formData);
      const { successCount, failures } = response.data.data;

      // 성공 메시지
      let message = `총 ${successCount}건이 성공적으로 등록되었습니다.`;

      // 실패한 항목이 있다면 상세 메시지 추가
      if (failures && failures.length > 0) {
        message += `\n\n[등록 실패 항목]`;
        failures.forEach((fail) => {
          message += `\n- ${fail.row}행: ${fail.reason}`;
        });
      }

      alert(message);
      setUploadedFiles([]);
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
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
            onClick={() => {
              setSelectedTab("excel");
              handleTabClick("excel");
            }}
          >
            액셀 일괄 등록
          </button>
        </div>
      </div>

      {/* Content Container - Centered */}
      <div className={styles.contentContainer}>
        {/* File Template Section */}
        <div className={styles.templateSection}>
          <h2 className={styles.sectionTitle}>파일 양식</h2>
          <p className={styles.sectionDescription}>고객 데이터 작성 양식</p>

          <div className={styles.templateCard}>
            <div className={styles.templateInfo}>
              <div className={styles.templateIcon}>📄</div>
              <span className={styles.templateName}>
                CustomerListTemplate 2025.xlsx
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

        {/* Data Upload Section */}
        <div className={styles.uploadSection}>
          <h2 className={styles.sectionTitle}>데이터 삽입</h2>
          <p className={styles.uploadDescription}>
            Please upload files in pdf, docx or doc format and make sure the
            file size is under 25 MB.
          </p>

          <ExcelUploadBox
            onFileSelect={(file) => {
              if (file && !uploadedFiles.some((f) => f.name === file.name)) {
                setUploadedFiles((prev) => [...prev, file]);
              }
            }}
          />

          {/* Uploaded Files */}
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

          {/* Action Buttons - Right Aligned */}
          <div className={styles.buttonGroup}>
            <button className={`${styles.button} ${styles.cancelButton}`}>
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

export default CustomerExcelAdd;
