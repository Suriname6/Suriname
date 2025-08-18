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

  const downloadTemplate = async () => {
    try {
      const resp = await api.get("/api/products/template", {
        responseType: "blob",
      });
      const blob = new Blob([resp.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ProductListTemplate.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("템플릿 다운로드 실패");
    }
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);

    try {
      const resp = await api.post("/api/products/register/excel", formData);
      const payload = resp?.data;
      const data = payload?.data;

      const totalCount =
        typeof data?.totalCount === "number"
          ? data.totalCount
          : typeof payload?.totalCount === "number"
          ? payload.totalCount
          : null;

      const successCount =
        typeof data?.successCount === "number"
          ? data.successCount
          : typeof payload?.successCount === "number"
          ? payload.successCount
          : null;

      let failures = Array.isArray(data?.failures)
        ? data.failures
        : Array.isArray(payload?.failures)
        ? payload.failures
        : [];

      const failureCount =
        typeof data?.failureCount === "number"
          ? data.failureCount
          : typeof payload?.failureCount === "number"
          ? payload.failureCount
          : failures.length;

      const total =
        typeof totalCount === "number"
          ? totalCount
          : typeof successCount === "number"
          ? successCount + failureCount
          : null;

      let msg;
      if (typeof total === "number" && typeof successCount === "number") {
        msg = `총 ${total}건 중 ${successCount}건 성공, ${failureCount}건 실패`;
      } else if (typeof successCount === "number") {
        msg = `총 ${successCount}건 성공`;
      } else if (typeof payload?.message === "string") {
        msg = payload.message;
      } else {
        msg = "업로드 처리 결과를 확인했습니다.";
      }

      if (failures.length > 0) {
        msg += `\n\n[등록 실패 항목]`;
        failures.forEach((f) => {
          msg += `\n- ${f.row}행: ${f.reason}`;
        });
      }

      alert(msg);
      setUploadedFiles([]);
    } catch (error) {
      console.error("업로드 실패:", error);
      const serverMsg =
        error?.response?.data?.message ??
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null) ??
        error.message;
      alert("업로드 실패: " + serverMsg);
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
                ProductListTemplate.xlsx
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
