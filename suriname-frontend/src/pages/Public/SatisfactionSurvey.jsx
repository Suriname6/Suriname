import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Star, CheckCircle, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import styles from "../../css/Public/SatisfactionSurvey.module.css";

const SatisfactionSurvey = () => {
  const { completionId } = useParams();
  const navigate = useNavigate();
  
  const [completionInfo, setCompletionInfo] = useState(null);
  const [ratings, setRatings] = useState({
    overallRating: 0,
    serviceQualityRating: 0,
    responseTimeRating: 0,
    deliveryRating: 0,
    staffKindnessRating: 0
  });
  const [comments, setComments] = useState("");
  const [recommendToOthers, setRecommendToOthers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ratingCategories = [
    { key: "overallRating", label: "전체적인 만족도", icon: <Star size={20} /> },
    { key: "serviceQualityRating", label: "서비스 품질", icon: <CheckCircle size={20} /> },
    { key: "responseTimeRating", label: "응답 시간", icon: <MessageCircle size={20} /> },
    { key: "deliveryRating", label: "배송 서비스", icon: <CheckCircle size={20} /> },
    { key: "staffKindnessRating", label: "직원 친절도", icon: <ThumbsUp size={20} /> }
  ];

  useEffect(() => {
    if (completionId) {
      fetchCompletionInfo();
    }
  }, [completionId]);

  const fetchCompletionInfo = async () => {
    try {
      const response = await axios.get(`/api/completion/${completionId}`);
      setCompletionInfo(response.data.data);
    } catch (error) {
      console.error("완료 정보 조회 실패:", error);
      alert("완료 정보를 불러오는데 실패했습니다.");
    }
  };

  const handleRatingChange = (category, rating) => {
    setRatings({
      ...ratings,
      [category]: rating
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 항목 검증
    const requiredRatings = Object.values(ratings);
    if (requiredRatings.some(rating => rating === 0)) {
      alert("모든 항목에 대해 평점을 주세요.");
      return;
    }

    if (recommendToOthers === null) {
      alert("추천 의향을 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const surveyData = {
        completionId: parseInt(completionId),
        ...ratings,
        comments,
        recommendToOthers,
        surveyMethod: "ONLINE"
      };

      const response = await axios.post("/api/public/satisfaction/survey", surveyData);
      
      if (response.data.status === 201) {
        setSubmitted(true);
      } else {
        alert(response.data.message || "설문 제출에 실패했습니다.");
      }
    } catch (error) {
      console.error("만족도 설문 제출 실패:", error);
      const errorMessage = error.response?.data?.message || "설문 제출에 실패했습니다.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, category }) => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${styles.star} ${star <= rating ? styles.filled : styles.empty}`}
            onClick={() => onRatingChange(category, star)}
          >
            <Star size={24} />
          </button>
        ))}
        <span className={styles.ratingText}>
          {rating > 0 && `${rating}점`}
        </span>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle size={64} />
          </div>
          <h1>설문이 완료되었습니다!</h1>
          <p>소중한 의견을 주셔서 감사합니다.</p>
          <p>더 나은 서비스로 보답하겠습니다.</p>
          <button 
            className={styles.homeButton}
            onClick={() => navigate("/")}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>서비스 만족도 조사</h1>
        <p>서비스 이용에 대한 만족도를 평가해 주세요.</p>
      </div>

      {completionInfo && (
        <div className={styles.serviceInfo}>
          <h3>서비스 정보</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <strong>접수번호:</strong>
              <span>{completionInfo.requestNo}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>완료 타입:</strong>
              <span>{completionInfo.completionType}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>담당자:</strong>
              <span>{completionInfo.completedBy}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>완료일:</strong>
              <span>{new Date(completionInfo.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.surveyForm}>
        {/* 평점 섹션 */}
        <div className={styles.ratingsSection}>
          <h3>서비스 평가</h3>
          <p>각 항목에 대해 1점(매우 불만족)부터 5점(매우 만족)까지 평가해 주세요.</p>
          
          {ratingCategories.map((category) => (
            <div key={category.key} className={styles.ratingGroup}>
              <div className={styles.ratingLabel}>
                {category.icon}
                <span>{category.label}</span>
              </div>
              <StarRating
                rating={ratings[category.key]}
                onRatingChange={handleRatingChange}
                category={category.key}
              />
            </div>
          ))}
        </div>

        {/* 추천 의향 섹션 */}
        <div className={styles.recommendSection}>
          <h3>추천 의향</h3>
          <p>주변 지인에게 저희 서비스를 추천하시겠습니까?</p>
          <div className={styles.recommendOptions}>
            <button
              type="button"
              className={`${styles.recommendButton} ${recommendToOthers === true ? styles.selected : ""}`}
              onClick={() => setRecommendToOthers(true)}
            >
              <ThumbsUp size={20} />
              예, 추천하겠습니다
            </button>
            <button
              type="button"
              className={`${styles.recommendButton} ${recommendToOthers === false ? styles.selected : ""}`}
              onClick={() => setRecommendToOthers(false)}
            >
              <ThumbsDown size={20} />
              아니요, 추천하지 않겠습니다
            </button>
          </div>
        </div>

        {/* 의견 섹션 */}
        <div className={styles.commentsSection}>
          <h3>추가 의견</h3>
          <p>서비스 개선을 위한 의견이나 건의사항이 있으시면 자유롭게 작성해 주세요.</p>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="의견을 입력해 주세요..."
            rows={5}
            className={styles.commentsTextarea}
          />
        </div>

        <div className={styles.submitSection}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "제출 중..." : "설문 제출"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SatisfactionSurvey;