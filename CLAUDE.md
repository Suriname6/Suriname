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

### Deletion Safety Protocol
- **Git checkpoint only**: Single commit before major deletions (no verbose documentation)
- **Comment over delete**: Use `// DISABLED:` or `/* REMOVED: */` for code removal
- **Simple recovery**: `git reset --hard HEAD~1` command only if needed
- **No backup files**: Avoid creating `.bak` or temporary files

### SuperClaude 필수 활용 Protocol
- **명령어 우선 검토**: 모든 코딩 작업 전 적절한 SuperClaude 명령어부터 고려
- **복잡도별 자동 선택**:
  - 단순 수정/버그픽스: `/implement` 또는 직접 실행
  - 시스템 분석 필요: `/analyze` → 후속 명령어
  - 새 기능 구현: `/design` → `/implement`
  - 성능/품질 개선: `/improve`
  - 아키텍처 설계: `/design`
- **Wave 모드 활용**: 복잡도 ≥0.7, 파일 >20개, 다중 도메인 작업 시 자동 적용
- **예외 상황**: 즉시 처리가 필요한 긴급 버그픽스, 단일 라인 수정만 직접 실행 허용

### SuperClaude 강제 준수 Rules
- **MANDATORY 체크리스트**: 작업 시작 전 반드시 확인
  - [ ] "이 작업에 적합한 SuperClaude 명령어가 있는가?"
  - [ ] "계획 수립이 필요한 작업인가? → `/design` 사용"
  - [ ] "문제 분석이 필요한 작업인가? → `/analyze` 사용"
  - [ ] "코드 개선이 목적인가? → `/improve` 사용"
- **자동 트리거 키워드**: 다음 단어 감지 시 해당 명령어 우선 실행
  - "계획", "설계", "아키텍처" → `/design`
  - "분석", "조사", "문제", "원인" → `/analyze`
  - "개선", "최적화", "리팩토링" → `/improve`
  - "구현", "만들어", "추가" → `/implement`
- **직접 실행 금지**: 다음 경우를 제외하고 슬래시 명령어 없는 직접 코딩 금지
  - 단일 라인 typo 수정
  - 즉시 처리 긴급 상황 (명시적으로 "긴급" 언급된 경우만)
  - 사용자가 "직접 실행해줘"라고 명시적 요청
- **위반 시 자동 수정**: SuperClaude 명령어 없이 시작했다면 즉시 중단하고 적절한 명령어부터 재시작

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

---

## Project Structure

This is a comprehensive customer service management system named "Suriname" with separate backend and frontend directories:

- **suriname-backend/**: Spring Boot application with Java 21, Spring Security, JPA, MySQL, and JWT authentication
- **suriname-frontend/**: React application built with Vite, using React Router and Lucide React icons

## Development Commands

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