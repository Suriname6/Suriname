import React from "react";
import mainBack from "../../assets/mainBack.png";
import mainRight from "../../assets/mainRight.png";
import styles from "./FirstMain.module.css";
import logo from "../../assets/suriname.png";
import { useNavigate } from "react-router-dom";

import {
  DollarSign,
  BarChart3,
  FileText,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Settings,
  MapPin,
} from "lucide-react";

export default function SurinameAS() {
  const navigate = useNavigate();
  const services = [
    {
      icon: FileText,
      title: "접수 등록",
      desc: ["고객/제품 선택", "요청 내용 입력", "SMS 알림"],
    },
    {
      icon: Settings,
      title: "수리 처리",
      desc: ["상태 흐름 관리", "수리 프리셋 활용", "배송 관리"],
    },
    {
      icon: DollarSign,
      title: "입금 관리",
      desc: ["자동 금액 산정", "가상계좌 발급", "입금 확인"],
    },
    {
      icon: BarChart3,
      title: "실시간 통계 시스템",
      desc: ["날짜별 접수·완료 현황", "직원 성과 차트", "상태별 분포 차트"],
    },
  ];

  return (
    <div className={styles.snPage}>
      {/* Hero */}
      <section
        className={styles.snHero}
        style={{
          backgroundImage: `url(${mainBack})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className={styles.snHeroContent}>
          <h1 className={styles.snHeroH1}>SURINAME</h1>
          <h2 className={styles.snHeroH2}>
            접수·수리·입금·배송
            <br />한 번에 끝내는 A/S 관리
          </h2>
          <button
            type="button"
            className={styles.snHeroBtn}
            onClick={() => navigate("/login")}
          >
            시작하기
          </button>
        </div>
      </section>

      {/* Intro */}
      <section className={styles.snContent}>
        <div className={styles.snContainer}>
          <div className={styles.snIntroGrid}>
            <div className={styles.snIntroCard}>
              <h3 className={styles.snIntroTitle}>
                통합 A/S 접수·처리 시스템이란?
              </h3>
              <p className={styles.snIntroDesc}>
                고객의 요청부터 수리 완료까지, 모든 과정을 효율적으로 관리하는
                혁신적 솔루션
              </p>
              <ul className={styles.snIntroList}>
                <li className={styles.snIntroLi}>
                  <CheckCircle2 className={styles.snCheckIcon} />
                  <span>고객 데이터 정보 및 자동완성 지원</span>
                </li>
                <li className={styles.snIntroLi}>
                  <CheckCircle2 className={styles.snCheckIcon} />
                  <span>접수 시 고객 알림(SMS) 자동 발송</span>
                </li>
                <li className={styles.snIntroLi}>
                  <CheckCircle2 className={styles.snCheckIcon} />
                  <span>수리 내역 프로세스로 빠른 업무 개선</span>
                </li>
                <li className={styles.snIntroLi}>
                  <CheckCircle2 className={styles.snCheckIcon} />
                  <span>통계 대시보드로 업무 시각화</span>
                </li>
              </ul>
            </div>

            <div className={styles.snIntroImageCard}>
              <img
                src={mainRight}
                alt="수리 작업 이미지"
                className={styles.snIntroImage}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className={styles.snServices}>
        <div className={styles.snContainer}>
          <h3 className={styles.snServicesTitle}>Services</h3>

          <div className={styles.snServicesGrid}>
            {services.map(({ icon, title, desc }, i) => (
              <div key={i} className={styles.snServiceItem}>
                <div className={styles.snDiamond}>
                  <div className={styles.snDiamondInner}>
                    {React.createElement(icon, {
                      className: styles.snServiceIcon,
                    })}
                  </div>
                </div>
                <h4 className={styles.snServiceTitle}>{title}</h4>
                <ul className={styles.snServiceDesc}>
                  {desc.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.snFooter}>
        <div className={`${styles.snContainer} ${styles.snFooterContent}`}>
          {/* 로고 */}
          <div className={styles.snFooterBrandWrap}>
            <img
              src={logo}
              alt="SURINAME"
              className={styles.snFooterBrandImg}
            />
          </div>

          {/* CONTACT US */}
          <div className={styles.snFooterSection}>
            <h5 className={styles.snFooterHeading}>CONTACT US</h5>
            <div className={styles.snFooterRow}>
              <Phone className={styles.snFooterIcon} />
              <span className={styles.snFooterLabel}>전화번호</span>
              <a href="tel:+19998887654" className={styles.snFooterLink}>
                070-1234-5678
              </a>
            </div>
            <div className={styles.snFooterRow}>
              <Mail className={styles.snFooterIcon} />
              <span className={styles.snFooterLabel}>이메일</span>
              <a
                href="mailto:suriname@gmail.com"
                className={styles.snFooterLink}
              >
                suriname@gmail.com
              </a>
            </div>
          </div>

          {/* ADDRESS */}
          <div className={styles.snFooterSection}>
            <h5 className={styles.snFooterHeading}>ADDRESS</h5>
            <div className={styles.snFooterRow}>
              <MapPin className={styles.snFooterIcon} />
              <span className={styles.snFooterLabel}>주소</span>
              <span className={styles.snFooterText}>서울 강남구 역삼동</span>
            </div>
            <div className={styles.snFooterRow}>
              <Clock className={styles.snFooterIcon} />
              <span className={styles.snFooterLabel}>영업시간</span>
              <span className={styles.snFooterText}>9am—6pm</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
