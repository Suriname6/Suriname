import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import "../css/Signup.css";
import Logo from "../assets/suriname.png";

function SignupPage() {
  const navigate = useNavigate();
  const detailAddrRef = useRef(null);

  const INITIAL_FORM = {
    loginId: "",
    name: "",
    email: "",
    birth: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    address: "",
    addressDetail: "",
  };

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [idChecked, setIdChecked] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "loginId") {
      setIdChecked(false);
    }
  };

  const formatPhone010 = (value) => {
    let d = value.replace(/\D/g, "").slice(0, 11);
    if (d && !d.startsWith("010")) d = "010" + d.replace(/^010?/, "");
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: formatPhone010(value) }));
  };

  const handleCheckLoginId = async () => {
    if (!formData.loginId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }
    try {
      const response = await axios.get(
        `/api/users/validate/loginId/${formData.loginId}`
      );
      if (response.data) {
        alert("이미 사용 중인 아이디입니다.");
        setIdChecked(false);
      } else {
        alert("사용 가능한 아이디입니다.");
        setIdChecked(true);
      }
    } catch (err) {
      alert("아이디 확인 중 오류가 발생했습니다.");
      setIdChecked(false);
    }
  };

  const loadDaumPostcode = () =>
    new Promise((resolve) => {
      if (window.daum?.Postcode) return resolve();
      const s = document.createElement("script");
      s.src =
        "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      s.onload = resolve;
      document.head.appendChild(s);
    });

  const openAddressSearch = async () => {
    await loadDaumPostcode();
    new window.daum.Postcode({
      oncomplete: (data) => {
        const road = data.roadAddress;
        const jibun = data.jibunAddress;
        const addr = road || jibun || "";
        setFormData((prev) => ({ ...prev, address: addr, addressDetail: "" }));
        setTimeout(() => detailAddrRef.current?.focus(), 0);
      },
    }).open();
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(formData.email)) {
      setError("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const addressFull = [formData.address, formData.addressDetail]
        .filter(Boolean)
        .join(" ");

      const formDataToSend = {
        ...formData,
        phone: formData.phone.replace(/-/g, ""),
        address: addressFull,
      };

      await axios.post("/api/users", formDataToSend);
      alert("회원가입이 완료되었습니다. 로그인 해주세요!");
      navigate("/login");
      setFormData(INITIAL_FORM);
    } catch (err) {
      setError("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignup}>
        <div className="logo-wrapper">
          <img src={Logo} alt="SURINAME" className="logo" />

          <div className="form-group">
            <label htmlFor="loginId">아이디</label>
            <div className="id-check-wrapper">
              <input
                type="text"
                id="loginId"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="check-btn"
                onClick={handleCheckLoginId}
              >
                중복확인
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@domain.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">주소</label>
            <div className="address-wrapper">
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                readOnly
                required
                placeholder="도로명 주소 검색"
              />
              <button
                type="button"
                className="check-btn"
                onClick={openAddressSearch}
              >
                주소검색
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="addressDetail">상세주소</label>
            <input
              type="text"
              id="addressDetail"
              name="addressDetail"
              value={formData.addressDetail}
              onChange={handleChange}
              placeholder="상세 주소 (동/호수 등)"
              ref={detailAddrRef}
            />
          </div>

          <div className="form-group">
            <label htmlFor="birth">생년월일</label>
            <input
              type="date"
              id="birth"
              name="birth"
              value={formData.birth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="비밀번호는 8자리 이상 입력해주세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">비밀번호 확인</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">연락처</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              required
              placeholder="010-0000-0000"
              inputMode="numeric"
              maxLength={13}
            />
          </div>

          <button type="submit">회원가입</button>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div className="bottom-link">
            계정이 이미 있으신가요? <a href="/login">로그인하기</a>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SignupPage;
