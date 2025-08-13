import SidebarNavigation from "../components/SidebarNavigation";
import "../css/Home.css";

export default function Home() {
  return (
    <div className="layout-container">
      <SidebarNavigation />
      <main className="home-main">
        <h1>환영합니다!</h1>
        <p>로그인 없이 접근 가능한 기본 홈 화면입니다.</p>
        <p>시각: {new Date().toLocaleString()}</p>
      </main>
    </div>
  );
}
