import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import "../css/Signup.css";
import Logo from "../assets/suriname.png";

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: "",
    name: "",
    email: "",
    birth: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    address: "",
  });

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

   const handleCheckLoginId = async () => {
    if (!formData.loginId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }
    try {
      const response = await axios.get(`/api/users/validate/loginId/${formData.loginId}`);
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await axios.post("/api/users", formData);
      alert("회원가입이 완료되었습니다. 로그인 해주세요!");
      navigate("/login");
      setFormData({
        loginId: "",
        name: "",
        email: "",
        birth: "",
        password: "",
        passwordConfirm: "",
        phone: "",
        address: "",
      });
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">주소</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="예: 서울특별시 강남구 테헤란로 123 4층 (역삼동)"
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
            onChange={handleChange}
            required
            placeholder="-를 포함해 입력"
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
