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
      navigate("/customer/register");
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const downloadTemplate = async () => {
    try {
      const res = await api.get("/api/customers/template", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "CustomerListTemplate.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("템플릿 다운로드에 실패했습니다.");
    }
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);

    const resp = await api.post("/api/customers/register/excel", formData);
    const body = resp?.data?.data ?? resp?.data ?? {};
    const { totalCount, successCount, failureCount, failures = [] } = body;

    const total =
      typeof totalCount === "number"
        ? totalCount
        : typeof successCount === "number" && Array.isArray(failures)
        ? successCount + failures.length
        : null;

    let msg;
    if (typeof total === "number") {
      msg = `총 ${total}건 중 ${successCount}건 성공, ${
        failureCount ?? failures.length
      }건 실패`;
    } else if (typeof successCount === "number") {
      msg = `총 ${successCount}건 성공`;
    } else {
      msg = body?.message || "업로드 처리 결과를 확인했습니다.";
    }

    if (failures.length > 0) {
      msg += `\n\n[등록 실패 항목]`;
      failures.forEach((f) => {
        msg += `\n- ${f.row}행: ${f.reason}`;
      });
    }

    alert(msg);
    setUploadedFiles([]);
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
            엑셀 일괄 등록
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className={styles.contentContainer}>
        {/* File Template Section */}
        <div className={styles.templateSection}>
          <h2 className={styles.sectionTitle}>파일 양식</h2>
          <p className={styles.sectionDescription}>고객 데이터 작성 양식</p>

          <div className={styles.templateCard}>
            <div className={styles.templateInfo}>
              <div className={styles.templateIcon}>📄</div>
              <span className={styles.templateName}>
                CustomerListTemplate.xlsx
              </span>
              <span className={styles.templateBadge}>XLSX</span>
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
