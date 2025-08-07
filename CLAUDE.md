# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## SuperClaude Integration
**SuperClaude v3.0.0 Activated** 🚀

SuperClaude Framework는 고급 명령어 시스템과 AI 페르소나를 제공합니다.

### 사용 가능한 슬래시 명령어:
- `/analyze` - 코드 및 시스템 분석
- `/implement` - 기능 구현
- `/improve` - 코드 개선 및 최적화
- `/build` - 프로젝트 빌드 및 배포
- `/troubleshoot` - 문제 해결
- `/test` - 테스트 관리
- `/document` - 문서화
- `/design` - 아키텍처 설계

**명령어 사용법**: `/analyze [대상]`, `/implement [기능설명]`, `/improve [대상]`

### SuperClaude 시스템 참조:
@~/.claude/COMMANDS.md
@~/.claude/FLAGS.md  
@~/.claude/PRINCIPLES.md

---

## AI Developer Behavior Rules

### Auto-Accept Edits Protocol
- **Initial plan approval**: Always present implementation plan for user review before starting
- **Post-approval execution**: Once plan is approved, proceed directly without further confirmations
- **No mid-task approvals**: Avoid repeated confirmation requests during execution
- **Action-first after approval**: Execute tasks directly after initial plan confirmation

### Professional Developer Partnership Rules
- **Provide alternatives**: When user suggests suboptimal approaches, offer better technical solutions
- **Challenge decisions constructively**: Don't just agree - provide professional engineering judgment  
- **Proactive problem-solving**: Anticipate issues and suggest preventive measures
- **Evidence-based recommendations**: Support suggestions with technical reasoning and best practices
- **Focus on user intent**: Address what the user actually wants, not just what they said
- **Avoid unnecessary explanations**: Execute tasks directly without verbose preambles

### Communication Style
- **Concise and direct**: Minimize unnecessary words and explanations
- **Task-focused**: Stay on topic and avoid tangential information
- **Results-oriented**: Show outcomes rather than describing processes
- **Korean context-aware**: Use appropriate Korean technical terms and business context

### Port Conflict Auto-Resolution Protocol v1.0
- **Immediate detection**: Use `netstat -ano | findstr :[PORT]` to identify conflicting processes
- **Fast termination**: Execute `taskkill //PID [PID] //F` without hesitation
- **Multi-port check**: Simultaneously check 8080, 8081, 8082, 5173, 5174, 5175 ports
- **Auto-retry**: Restart services automatically after port cleanup
- **Batch commands**: Use single command chains like `netstat -ano | findstr :8081 && taskkill //PID [PID] //F && ./gradlew bootRun`
- **No manual intervention**: Never ask user permission for port cleanup - execute immediately

### Port Management Commands
```bash
# Backend (Spring Boot): Default 8081, fallback 8080, 8082
# Frontend (Vite): Default 5173, auto-increment 5174, 5175, 5176
# Kill all Java processes: taskkill //F //IM java.exe
# Kill specific port: netstat -ano | findstr :8081 | for /f "tokens=5" %a in ('more') do taskkill //PID %a //F
# Comprehensive cleanup: for %p in (8080 8081 8082 5173 5174 5175) do (netstat -ano | findstr :%p && taskkill //F //IM *)
```

### Deletion Safety Protocol
- **Git checkpoint only**: Single commit before major deletions (no verbose documentation)
- **Comment over delete**: Use `// DISABLED:` or `/* REMOVED: */` for code removal
- **Simple recovery**: `git reset --hard HEAD~1` command only if needed
- **No backup files**: Avoid creating `.bak` or temporary files

### SuperClaude 필수 활용 Protocol v4.0

#### **MANDATORY 워크플로우**: 계획 → 승인 → 자동완료
- **질문이 아닌 모든 요청**: 반드시 계획 보고 후 승인 받고 자동 완료까지 진행
- **계획 보고 필수 포함 요소**:
  - [ ] 적용할 SuperClaude 명령어 명시
  - [ ] 자동 활용할 MCP 서버 명시  
  - [ ] 단계별 실행 계획 (시간 예상 포함)
  - [ ] 예상 위험도 및 성공 기준
- **승인 키워드**: "진행해", "좋아", "ㄱㄱ", "업그레이드해" → 즉시 자동 완료 모드

#### **SuperClaude 명령어 자동 매핑**
- **분석/조사/문제해결**: `/analyze --seq --c7` (Sequential + Context7)
- **새 기능 구현**: `/implement --magic --c7` (Magic + Context7)
- **코드 개선/최적화**: `/improve --seq --wave-mode` (Sequential + Wave)
- **아키텍처/설계**: `/design --seq --c7 --persona-architect` 
- **시스템 정리**: `/cleanup --seq --refactorer`
- **문서화**: `/document --c7 --persona-scribe=ko`
- **테스트**: `/test --play --qa`

#### **MCP 서버 자동 활용 매트릭스**
- **Context7 자동 활성화**: 프레임워크/라이브러리 작업, 문서화, 패턴 적용
- **Sequential 자동 활성화**: 복잡한 분석, 시스템 설계, 다단계 작업
- **Magic 자동 활성화**: React 컴포넌트, UI/UX, 프론트엔드 작업
- **Playwright 자동 활성화**: 테스트, 브라우저 작업, E2E 검증

#### **Wave 모드 자동 트리거**
- **복잡도 ≥0.7**: 시스템 전반 영향, 다중 도메인, 아키텍처 변경
- **파일 수 >20**: 대규모 리팩토링, 프로젝트 전체 개선
- **키워드 감지**: "전체", "시스템", "comprehensive", "enterprise"

#### **직접 실행 절대 금지 - SuperClaude 필수 원칙 v4.1**

**절대적 규칙**: 어떤 경우라도 예외 없이 계획 보고 우선
- **모든 작업** = 계획 보고 → 승인 → 자동 완료 (100% 엄격 준수)
- **예외 없음**: typo, 긴급상황, 간단한 작업 등 어떤 이유로도 직접 실행 금지
- **AI 판단 완전 금지**: 작업의 복잡도, 긴급성, 중요도를 AI가 임의 판단하여 프로세스 생략 절대 금지
- **사용자 명령 절대 준수**: "직접 해줘", "긴급" 등의 표현과 관계없이 무조건 계획 보고부터 시작

**위반 시 처리**:
- 즉시 작업 중단 → 사과 → 올바른 SuperClaude 명령어로 계획 보고 재시작

### 자동 실행 시스템 v4.0 통합

#### **계획 보고 자동화**
```yaml
auto_planning_triggers:
  - 모든 비질문 요청 (구현, 분석, 개선, 설계 등)
  - 복잡도 >0.5 작업
  - 다중 파일 수정
  - 시스템 영향 작업

planning_template:
  superClaude_command: "적용할 /command"
  mcp_servers: ["Context7", "Sequential", "Magic", "Playwright"]
  execution_steps: "단계별 세부 계획"
  time_estimate: "예상 소요시간"
  risk_level: "낮음/중간/높음"
  success_criteria: "완료 기준"

auto_approval_scope:
  - 초기 계획의 합리적 확장 (30% 범위 내)
  - 관련 기능 보완 및 개선
  - 버그 수정 및 최적화
  - UI/UX 개선사항
  - 데이터 검증 및 에러 핸들링
  - 성능 개선 작업
  
requires_approval:
  - 새로운 주요 기능 추가 (계획 범위 +50% 초과)
  - 아키텍처 근본 변경
  - 보안 관련 중요 변경
  - 데이터베이스 스키마 변경
```

#### **MCP 서버 지능형 선택**
```yaml
auto_mcp_selection:
  Context7:
    triggers: ["React", "Spring", "framework", "library", "document"]
    usage: "프레임워크 패턴, 공식 문서, 모범 사례"
  
  Sequential:
    triggers: ["analyze", "complex", "multi-step", "system"]
    usage: "복잡한 분석, 체계적 접근, 단계적 사고"
  
  Magic:
    triggers: ["component", "UI", "React", "frontend", "design"]
    usage: "UI 컴포넌트, 디자인 시스템, 프론트엔드"
  
  Playwright:
    triggers: ["test", "E2E", "browser", "automation"]
    usage: "테스트 자동화, 브라우저 제어, 검증"
```

#### **자동 완료 워크플로우**
```yaml
execution_flow:
  1. 사용자 요청 분석
  2. SuperClaude 명령어 매핑
  3. MCP 서버 자동 선택
  4. 계획 보고 + 승인 대기
  5. 승인 시 자동 완료 (중간 승인 없음)
  6. 결과 보고 + 다음 권장사항

approval_keywords: ["진행해", "좋아", "ㄱㄱ", "업그레이드해", "시작해"]
auto_execution: true
no_mid_confirmations: true
```

### Team Project Authority Control
- **우리 권한 영역** (박재엽 파트 - 배송 관리):
  - `suriname-frontend/src/pages/Delivery/` (DeliveryList, DeliveryRegister, DeliveryAnalytics)
  - `suriname-frontend/src/css/Delivery/` (모든 배송 관련 CSS)
  - `suriname-frontend/src/pages/Public/DeliveryTracking.jsx` (고객용 배송조회)
  - `suriname-frontend/src/pages/Public/SatisfactionSurvey.jsx` (만족도 조사)
  - `suriname-frontend/src/css/Public/DeliveryTracking.module.css`
  - `suriname-backend/src/main/java/com/suriname/delivery/` (전체 delivery 패키지)

- **절대 금지 영역** (다른 팀원 담당):
  - Customer 관련 파일 (김채연)
  - Payment 관련 파일 (오세민)  
  - Request/Repair 관련 파일 (심우석)
  - Analytics/Dashboard 관련 파일 (정은총)
  - Staff/Employee 관련 파일 (김현민)

- **제한적 수정 허용** (배송 관련만):
  - `App.jsx`: 배송 라우트 추가/수정만 허용
  - `SidebarNavigation.jsx`: 배송 메뉴 항목만 수정 허용
  - 기타 전역 파일: 사전 승인 필요

- **권한 위반 방지책**:
  - 파일 수정 전 경로 체크 필수
  - 금지 영역 접근 시 즉시 중단 + 경고
  - 전역 영향 파일 수정 시 범위 명시 필요
  - Git 커밋 전 권한 영역 검증

### Git Safety & Recovery Protocol
- **사고 원인 분석**: `git reset --hard HEAD~1` 사용 시 uncommitted 변경사항 손실
- **방지책**:
  - 중요 변경 전 항상 `git add . && git commit -m "checkpoint"` 실행
  - `git reset` 대신 `git stash` 사용 권장
  - CLAUDE.md 변경 시 즉시 커밋 필수
- **복구 절차**: `git stash` → 작업 → 문제 발생 시 `git stash pop`으로 복구
- **위험 명령어**: `git reset --hard`, `git clean -fd` 사용 전 반드시 stash 또는 commit

### Claude Code Usage Monitor 자동 실행 규칙
- **트리거 키워드**: "토큰", "사용량", "usage", "모니터", "monitor", "사용률", "한도", "limit", "cost", "비용"
- **자동 실행**: 위 키워드 감지 시 `claude-code-monitor` 명령어 자동 실행
- **실행 옵션**: 기본 실시간 모니터링, 필요시 `--view daily/monthly` 옵션 추가
- **예외**: 질문이나 설명 요청인 경우 모니터 실행하지 않고 설명만 제공

### Port Management Auto-Execution Rules
- **트리거 키워드**: "포트", "port", "충돌", "conflict", "8081", "5173", "already in use", "뱅뱅", "막힘", "안되는"
- **자동 실행 단계**:
  1. `netstat -ano | findstr :[PORT]` - 포트 사용 프로세스 즉시 확인
  2. `taskkill //PID [PID] //F` - 해당 프로세스 강제 종료 (승인 없음)
  3. 서비스 자동 재시작 (Backend: `./gradlew bootRun`, Frontend: `npm run dev`)
- **일괄 정리**: "전체 포트 정리" 요청 시 8080,8081,8082,5173,5174,5175 모든 포트 자동 정리
- **예외**: 프로덕션 환경 또는 중요 시스템 프로세스는 확인 후 진행

### CSS Scope Protection Protocol v1.0 ⚠️ CRITICAL
**문제**: 특정 페이지 CSS 수정 시 다른 페이지까지 영향을 줘서 화면비 깨짐 반복

**필수 검증 단계** (절대 생략 금지):
1. **파일 경로 확인**: `pages/[특정페이지]/[Component].module.css` 인지 전역 CSS인지 반드시 확인
2. **CSS Modules 확인**: `styles.[className]` 형태인지, 전역 클래스인지 구분
3. **영향도 분석**: 해당 CSS가 다른 컴포넌트에서도 사용되는지 Grep으로 검색
4. **스코프 제한**: 오직 해당 페이지/컴포넌트에만 영향을 주도록 CSS 작성

**절대 금지 사항**:
- ❌ App.css, index.css 같은 전역 CSS 함부로 수정
- ❌ 공통 컴포넌트 CSS 무단 변경
- ❌ CSS 클래스명이 겹칠 수 있는 일반적인 이름 사용
- ❌ 미디어 쿼리나 전역 선택자 무분별 추가

**안전한 CSS 수정 패턴**:
```css
/* ✅ 올바른 방법: 컴포넌트별 CSS Modules */
.specificPageContainer { /* DeliveryList.module.css 내부 */
  width: 100%;
  max-width: 1200px;
}

/* ❌ 잘못된 방법: 전역 영향 */
.container { /* 다른 페이지 container도 영향받음 */
  width: 100%;
}
```

**검증 명령어**:
```bash
# CSS 클래스 사용처 확인 (수정 전 필수 실행)
grep -r "className" src/ | grep "[수정할클래스명]"
grep -r "styles\." src/ | grep "[수정할클래스명]"
```

---

## Project Structure

This is a comprehensive customer service management system named "Suriname" with separate backend and frontend directories:

- **suriname-backend/**: Spring Boot application with Java 21, Spring Security, JPA, MySQL, and JWT authentication
- **suriname-frontend/**: React application built with Vite, using React Router and Lucide React icons

## Development Commands

### Quick Start (Auto Port Management)
```bash
# Auto-cleanup and start backend
netstat -ano | findstr :8081 | for /f "tokens=5" %a in ('more') do taskkill //PID %a //F; cd suriname-backend && ./gradlew bootRun

# Auto-cleanup and start frontend  
netstat -ano | findstr :5173 | for /f "tokens=5" %a in ('more') do taskkill //PID %a //F; cd suriname-frontend && npm run dev

# Emergency port cleanup (all development ports)
for %p in (8080 8081 8082 5173 5174 5175) do (netstat -ano | findstr :%p && for /f "tokens=5" %a in ('netstat -ano ^| findstr :%p') do taskkill //PID %a //F)
```

### Frontend (suriname-frontend/)
```bash
cd suriname-frontend
npm run dev          # Start development server (Vite on port 5173)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (suriname-backend/)
```bash
cd suriname-backend
./gradlew bootRun    # Start Spring Boot application (port 8081)
./gradlew build      # Build the application
./gradlew test       # Run tests with JUnit Platform
```

### Port Troubleshooting Automation
```bash
# Find process using specific port
netstat -ano | findstr :8081

# Kill process immediately (replace PID)
taskkill //PID [PID_NUMBER] //F

# One-liner port cleanup and restart
netstat -ano | findstr :8081 && for /f "tokens=5" %a in ('netstat -ano ^| findstr :8081') do taskkill //PID %a //F && cd suriname-backend && ./gradlew bootRun
```

## Architecture Overview

### Backend Architecture (Enterprise-Level)
- **Spring Boot 3.5.4** with Java 21
- **JWT Authentication** with role-based access (Admin/Employee)
- **Spring Security** with custom filters and token providers
- **Spring Data JPA** with MySQL database and Specification queries
- **Multi-file upload** support (10MB limit) with Apache POI for Excel processing
- **Payment integration** with PortOne API and webhooks
- **OpenAPI documentation** (Swagger UI)
- **Environment configuration** with dotenv support

### Core Business Modules
- **Customer Management**: CRUD operations, Excel import/export, search filtering
- **Employee Management**: Role-based authentication, employee profiles
- **Analytics**: Dashboard statistics, trend analysis, category insights
- **Payment System**: Virtual account creation, webhook handling, payment tracking
- **Request/Assignment System**: Service request tracking and assignment
- **Product & Category Management**: Product catalog and categorization

### Frontend Architecture
- **React 19** with modern hooks and routing
- **Role-based UI**: Dynamic sidebar rendering based on user permissions
- **Nested routing** with protected routes and layout components
- **API proxy**: Vite configured to proxy `/api` requests to backend (port 8081)
- **Component structure**: Organized by feature domains (Customer, Payment, etc.)

### Key Technical Features
- **JWT Security**: Token-based authentication with refresh mechanism
- **Excel Processing**: Customer data import/export functionality
- **Real-time Analytics**: Dashboard with business intelligence features
- **Payment Webhooks**: Automated payment status updates
- **File Upload**: Multi-file support with validation
- **Database Relationships**: Complex entity relationships with JPA associations

## Database Configuration
- MySQL database with JPA entities
- Connection pooling and transaction management
- Custom repository interfaces with Specification pattern for dynamic queries

## API Integration
- Frontend proxy configuration for `/api` routes to `localhost:8081`
- CORS configured for `localhost:5173` 
- JWT token handling in request headers

## Branch Structure
- **main**: Basic project setup
- **develop**: Main development branch with full feature set
- **feature/auth**: JWT authentication and role-based access
- **feature/payment**: PortOne payment integration
- **feature/analytics**: Dashboard and analytics features
- **feature/account**: User account management
- **feat/cp-manage**: Customer management features

## Team Development Rules & Conventions

**IMPORTANT**: This is a team project. Follow existing patterns and conventions exactly. Do not introduce new rules or modify existing architecture without team approval.

### Backend Conventions
- **Package Structure**: `com.suriname.{domain}.{layer}` (e.g., `com.suriname.customer.controller`)
- **Layer Pattern**: Controller → Service → Repository → Entity (strict separation)
- **Annotations**: 
  - `@RestController @RequestMapping @RequiredArgsConstructor` for controllers
  - `@Service @Transactional @RequiredArgsConstructor` for services  
  - `@Entity @Table @NoArgsConstructor(access = AccessLevel.PROTECTED) @Getter` for entities
- **Response Format**: Always return `Map.of("status", code, "data"|"message", value)`
- **DTO Pattern**: Separate DTOs for request/response (e.g., `CustomerRegisterDto`, `CustomerListDto`)
- **Builder Pattern**: Use `@Builder` for entity construction
- **Soft Delete**: Use `isDeleted` flag and `markAsDeleted()` method
- **Auditing**: `@PrePersist` and `@PreUpdate` for timestamps
- **Pagination**: Use Spring's `Pageable` and `Page<T>`
- **Error Handling**: Throw `RuntimeException` with descriptive messages

### Frontend Conventions  
- **CSS Modules**: Use `{Component}.module.css` for styling
- **API Calls**: Always use axios with `/api` prefix (proxied to backend)
- **Component Structure**: Functional components with hooks
- **State Management**: `useState` for local state, `useEffect` for side effects
- **Navigation**: Use `useNavigate` for routing
- **Icons**: Use Lucide React icons consistently
- **File Organization**: Group by feature (`pages/{Domain}/{Component}.jsx`)
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Korean Comments**: Use Korean for business logic comments

### API Response Patterns
- Success: `{status: 200|201, data: object}`  
- Error: `{status: 400|404|500, message: string}`
- Pagination: Spring Page object with `content`, `totalPages`, etc.

### Database Patterns
- **Entity Relationships**: Use JPA associations (`@OneToMany`, `@ManyToOne`)
- **Enums**: Use `@Enumerated(EnumType.STRING)` for status fields
- **ID Strategy**: `@GeneratedValue(strategy = GenerationType.IDENTITY)`
- **Specifications**: Use Criteria API for dynamic queries

### Security Patterns
- **JWT**: Token-based authentication with role checking
- **CORS**: Configured for localhost:5173 only
- **Endpoints**: Use `/api/{domain}` pattern consistently

## Team Project Structure & API Standards

**CRITICAL**: This project follows specific API design patterns established by the team. All new APIs must conform exactly to these standards.

### Team Role Distribution
- **김현민**: Authentication, Authorization, Security systems
- **김채연**: Customer management, Excel processing  
- **심우석**: A/S request system, SMS notifications
- **오세민**: Payment system, PG integration, virtual accounts
- **박재엽**: Delivery management, shipment tracking
- **정은총**: Analytics, Dashboard, Statistics, Reporting

### Established API Patterns
- **URL Structure**: `/api/{domain}/{resource}` (e.g., `/api/customers`, `/api/payments/virtual-account`)
- **HTTP Methods**: Strict REST compliance (GET/POST/PUT/DELETE)
- **Response Format**: 
  - Success: `{"status": 200|201, "data": object}`
  - Error: `{"status": 400|404|500, "message": string}`
- **Pagination**: Query params `?page=0&size=10` (Spring Pageable)
- **Search**: POST method with search criteria in request body
- **File Upload**: Use `multipart/form-data` format

### Domain-Specific Standards
- **Customer Registration**: Combined customer + product registration in single API
- **Soft Delete**: Use `isDeleted` flag, never hard delete
- **Excel Processing**: Support bulk operations with progress tracking
- **Request Numbers**: Auto-generate format `AS-YYYYMMDD-XXX`
- **Payment Integration**: PortOne webhook handling, virtual account creation
- **Status Management**: Enum-based status with transition rules
- **SMS Notifications**: Event-driven messaging for status changes

### Required Response Examples
```json
// Customer registration
{"status": 201, "data": {"customerId": 1, "customerProductId": 10}}

// List operations  
{"status": 200, "data": {"content": [...], "totalElements": 120}}

// Error handling
{"status": 400, "message": "고객을 찾을 수 없습니다"}
```

## Development Workflow
1. Start backend: `./gradlew bootRun` from suriname-backend/ (runs on port 8081)
2. Start frontend: `npm run dev` from suriname-frontend/ (runs on port 5173)
3. Access application at http://localhost:5173
4. API documentation available at http://localhost:8081/swagger-ui.html