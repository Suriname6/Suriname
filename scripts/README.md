# 🔧 Suriname 개발 환경 관리 도구

포트 충돌 없는 매끄러운 개발 환경을 위한 자동화 스크립트 모음

## 🚀 빠른 시작

```bash
# 개발 환경 원클릭 시작 (포트 충돌 자동 해결)
npm run dev

# 개발 환경 정리
npm run stop
```

## 📋 사용 가능한 명령어

### 메인 명령어
- `npm run dev` - 포트 충돌 자동 해결 후 백엔드+프론트엔드 시작
- `npm run stop` - 모든 개발 서버 정리
- `npm run build` - 프로덕션 빌드
- `npm run clean` - 강제 전체 정리 (위험)

### 포트 관리
- `npm run port:check` - 현재 포트 사용 상황 확인
- `npm run port:resolve` - 포트 충돌 자동 해결
- `npm run port:clean` - 개발 포트 강제 정리

### 개별 실행
- `npm run backend` - Spring Boot만 실행
- `npm run frontend` - React만 실행

## 🛠️ 스크립트 상세 설명

### 1. dev-start.js
**기능**: 포트 충돌 자동 해결 후 개발 환경 시작
- ✅ 포트 8081, 5173 사용 여부 확인
- ✅ 충돌 시 대안 포트 자동 할당 (8082, 5174 등)
- ✅ 설정 파일 자동 업데이트
- ✅ 백엔드 → 프론트엔드 순차 시작
- ✅ 브라우저 자동 열기

### 2. dev-stop.js  
**기능**: 개발 관련 모든 프로세스 정리
- 🛑 개발 포트 프로세스 종료 (8080~8084, 3000, 5173~5176)
- 🛑 Node.js 개발 서버 정리
- 🛑 Spring Boot 애플리케이션 종료
- 📊 정리 후 상태 확인

### 3. port-manager.js
**기능**: 포트 관리 유틸리티
- 🔍 포트 사용 상태 실시간 확인
- ⚙️ application.yml, vite.config.js 자동 업데이트
- 🔄 대안 포트 자동 할당
- 💀 특정 포트 프로세스 강제 종료

## 📊 포트 할당 규칙

### 기본 포트
- **Backend**: 8081 (Spring Boot)
- **Frontend**: 5173 (Vite Dev Server)

### 대안 포트 (충돌 시 자동 사용)
- **Backend**: 8082, 8083, 8084
- **Frontend**: 5174, 5175, 5176

## 🚨 문제 해결

### 포트 충돌이 계속 발생하는 경우
```bash
# 1. 강제 포트 정리
npm run port:clean

# 2. 전체 정리 (주의: 모든 Node.js/Java 프로세스 종료)
npm run clean

# 3. 상태 확인
npm run port:check

# 4. 다시 시작
npm run dev
```

### 특정 포트 문제 해결
```bash
# 특정 포트의 프로세스 강제 종료
node scripts/port-manager.js kill 8081

# 포트 충돌 자동 해결만 실행
node scripts/port-manager.js resolve
```

### 수동 실행 (스크립트 없이)
```bash
# 백엔드 (suriname-backend 디렉토리에서)
./gradlew bootRun

# 프론트엔드 (suriname-frontend 디렉토리에서)  
npm run dev
```

## 🔧 커스터마이징

### 포트 변경
`scripts/port-manager.js`의 `PROJECT_PORTS` 객체에서 기본값 수정:

```javascript
const PROJECT_PORTS = {
  backend: 8081,        // 원하는 백엔드 포트
  frontend: 5173,       // 원하는 프론트엔드 포트
  fallback: {
    backend: [8082, 8083, 8084],    // 대안 백엔드 포트들
    frontend: [5174, 5175, 5176]    // 대안 프론트엔드 포트들
  }
};
```

### 추가 포트 모니터링
`dev-stop.js`의 `devPorts` 배열에 모니터링할 포트 추가

## 📝 로그 및 디버깅

### 실행 로그 확인
```bash
# 개발 시작 시 로그
[BACKEND] Spring Boot 시작 로그...
[FRONTEND] Vite 시작 로그...

# 포트 상태 로그
Backend (8081): 🔴 사용 중 → 🟢 8082로 변경
Frontend (5173): 🟢 사용 가능
```

### 문제 발생 시 체크리스트
1. ✅ Node.js 18+ 버전 확인
2. ✅ Java 21 설치 확인  
3. ✅ 방화벽/보안프로그램 확인
4. ✅ 다른 개발 서버 종료 확인
5. ✅ scripts 디렉토리 권한 확인

## 🎯 개발 팁

### 매일 개발 시작 루틴
```bash
npm run dev      # 자동으로 모든 것 해결해줌!
```

### 개발 종료 루틴  
```bash
npm run stop     # 깔끔하게 정리
```

### 포트 상태가 궁금할 때
```bash
npm run port:check
```

이제 포트 충돌로 인한 개발 시간 낭비는 끝! 🎉