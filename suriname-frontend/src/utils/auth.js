export function getUserRole() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role; //"ADMIN", "STAFF", "ENGINEER"
  } catch (e) {
    console.error("JWT 파싱 실패:", e);
    return null;
  }
}
