import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (location.hostname === "localhost"
    ? "http://localhost:8081"
    : "/api");

const normalizedBase = API_BASE.replace(/\/$/, "");

const api = axios.create({
  baseURL: normalizedBase,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn("토큰 만료 - 로그아웃 처리");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      } else if (error.response.status === 403) {
        console.error("접근 거부:", error.response.data);
        alert("접근 권한이 없습니다. 관리자에게 문의하세요.");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
