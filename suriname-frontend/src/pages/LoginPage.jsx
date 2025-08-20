import { useState } from "react";
import axios from "../api/axiosInstance";
import "../css/Login.css";
import Logo from "../assets/suriname.png";
import Illustration from "../assets/illustration.png";

function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("/api/auth/login", {
        loginId,
        password,
      });

      const { accessToken, refreshToken, name, role } = response.data;

      if (role === "PENDING") { 
        alert("회원가입 승인 대기중입니다. 관리자 승인을 기다려주세요."); 
        return; 
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("name", name);
      localStorage.setItem("role", role);

      const user = {
        name: name || "",
        role: role,
        authorities: [{ authority: role }],
      };
      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="container">
      <div className="left-section">
        <img src={Logo} alt="SURINAME" className="logo" />
        <p className="description">
          제품 수리 요청부터 처리 이력까지 한눈에 관리할 수 있는 A/S 통합 시스템
        </p>

        <form className="auth-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="아이디"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">로그인</button>
          {error && <div className="error">{error}</div>}

          <div className="bottom-link">
            계정이 없으신가요? <a href="/signup">회원가입하기</a>
          </div>
        </form>
      </div>

      <div className="right-section">
        <img src={Illustration} alt="illustration" />
      </div>
    </div>
  );
}

export default LoginPage;
