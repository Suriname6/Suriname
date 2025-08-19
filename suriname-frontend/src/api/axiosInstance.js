import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized - 토큰 만료 또는 인증 실패");
    } else if (error.response?.status === 403) {
      console.error("403 Forbidden:", error.response.data);
      alert("접근 권한이 없습니다. 관리자에게 문의하세요.");
    }
    return Promise.reject(error);
  }
);

export default instance;
