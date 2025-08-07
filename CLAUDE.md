# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 Table of Contents

- [🚨 Critical Workflow Rules](#-critical-workflow-rules)
- [🤖 SuperClaude Framework](#-superclaude-framework)
- [⚡ Development Environment](#-development-environment)
- [👥 Team Collaboration](#-team-collaboration)
- [🏗️ Project Standards](#️-project-standards)
- [🔧 Automation Rules](#-automation-rules)
- [📖 Reference Documentation](#-reference-documentation)

---

## 🚨 Critical Workflow Rules

### Mandatory Execution Protocol v4.1
**Auto-Execution v5.0**: Planning report → Approval → Complete destination achievement (with variable handling)

- **DESTINATION-ORIENTED AUTOMATION**: Automatically resolve all reasonable variables to achieve approved destination
- **AUTO-RESOLVE SCOPE**: Technical dependencies, implementation changes, quality improvements
- **COMPLETE AFTER COMPLETION**: "✅ [Destination] Achievement Complete" → Immediate conversation termination
- **NO POST-COMPLETION QUESTIONS**: Completely prohibit "What's next?", "Additional?", "How about?"

**Variable Response Algorithm**:
```
Variable occurs → Destination relevance judgment → True: Auto-resolve → Continue
                                               → False: Stop → Request approval
```

### Auto-Accept Edits Protocol
- **Initial plan approval**: Always present implementation plan for user review
- **Post-approval execution**: Proceed directly without further confirmations
- **No mid-task approvals**: Avoid repeated confirmation requests during execution
- **Action-first after approval**: Execute tasks directly after plan confirmation

### Professional Developer Partnership
- **Provide alternatives**: Offer better technical solutions when user suggests suboptimal approaches
- **Constructive challenge**: Don't just agree - provide professional engineering judgment
- **Proactive problem-solving**: Anticipate issues and suggest preventive measures
- **Evidence-based recommendations**: Support suggestions with technical reasoning
- **Focus on user intent**: Address what user actually wants, not just what they said
- **Avoid unnecessary explanations**: Execute tasks directly without verbose preambles

### Communication Style
- **Concise and direct**: Minimize unnecessary words and explanations
- **Task-focused**: Stay on topic, avoid tangential information
- **Results-oriented**: Show outcomes rather than describing processes
- **Korean context-aware**: Use appropriate Korean technical terms and business context

---

## 🤖 SuperClaude Framework

### Available Commands
- `/analyze` - Code and system analysis
- `/implement` - Feature implementation
- `/improve` - Code improvement and optimization
- `/build` - Project build and deployment
- `/troubleshoot` - Problem solving
- `/test` - Test management
- `/document` - Documentation
- `/design` - Architecture design

### Command Auto-Mapping
- **Analysis/Investigation/Problem-solving**: `/analyze --seq --c7` (Sequential + Context7)
- **New Feature Implementation**: `/implement --magic --c7` (Magic + Context7)
- **Code Improvement/Optimization**: `/improve --seq --wave-mode` (Sequential + Wave)
- **Architecture/Design**: `/design --seq --c7 --persona-architect`
- **System Cleanup**: `/cleanup --seq --refactorer`
- **Documentation**: `/document --c7 --persona-scribe=ko`
- **Testing**: `/test --play --qa`

### MCP Server Auto-Activation Matrix
- **Context7**: Framework/library work, documentation, pattern application
- **Sequential**: Complex analysis, system design, multi-step tasks
- **Magic**: React components, UI/UX, frontend work
- **Playwright**: Testing, browser work, E2E validation

### Wave Mode Auto-Triggers
- **Complexity ≥0.7**: System-wide impact, multi-domain, architecture changes
- **File count >20**: Large-scale refactoring, project-wide improvements
- **Keywords**: "entire", "system", "comprehensive", "enterprise"

### Auto-Execution System v4.0
```yaml
auto_planning_triggers:
  - All non-question requests (implementation, analysis, improvement, design)
  - Complexity >0.5 tasks
  - Multi-file modifications
  - System impact tasks

planning_template:
  superClaude_command: "Applied /command"
  mcp_servers: ["Context7", "Sequential", "Magic", "Playwright"]
  execution_steps: "Detailed step-by-step plan"
  time_estimate: "Expected duration"
  risk_level: "Low/Medium/High"
  success_criteria: "Completion criteria"

auto_approval_scope:
  - Reasonable expansion of initial plan (within 30%)
  - Related feature improvements
  - Bug fixes and optimization
  - UI/UX improvements
  - Data validation and error handling
  - Performance improvements

requires_approval:
  - New major features (plan scope +50% exceeded)
  - Fundamental architecture changes
  - Critical security changes
  - Database schema changes
```

---

## ⚡ Development Environment

### Port Management System v1.0
- **Auto port management**: `npm run dev` - Auto-resolve port conflicts and start development environment
- **Port cleanup**: `npm run stop` - Clean shutdown of all development servers
- **Port status check**: `npm run port:check` - Real-time port usage status
- **Force cleanup**: `npm run clean` - Force kill all Node.js/Java processes
- **Standard ports**: Backend 8081, Frontend 5173 (auto-assign 8082, 5174 on conflict)
- **Auto config update**: application.yml, vite.config.js automatically updated on port changes
- **Reference**: `/scripts/README.md` detailed usage and troubleshooting guide

### Development Commands

#### Quick Start (Auto Port Management)
```bash
# Start everything with auto conflict resolution
npm run dev

# Manual startup
cd suriname-backend && ./gradlew bootRun  # Port 8081
cd suriname-frontend && npm run dev       # Port 5173

# Emergency port cleanup
npm run clean
```

#### Frontend (suriname-frontend/)
```bash
npm run dev          # Start development server (Vite on port 5173)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

#### Backend (suriname-backend/)
```bash
./gradlew bootRun    # Start Spring Boot application (port 8081)
./gradlew build      # Build the application
./gradlew test       # Run tests with JUnit Platform
```

### CSS Scope Protection Protocol v1.0 ⚠️ CRITICAL
**Problem**: CSS modifications affecting unrelated pages causing layout breaks

**Mandatory Validation Steps** (NEVER SKIP):
1. **File path check**: Verify `pages/[specific]/[Component].module.css` vs global CSS
2. **CSS Modules check**: Distinguish `styles.[className]` vs global classes
3. **Impact analysis**: Use Grep to check if CSS is used in other components
4. **Scope limitation**: Ensure CSS affects ONLY target page/component

**Absolutely Forbidden**:
- ❌ Modifying global CSS (App.css, index.css) without approval
- ❌ Unauthorized changes to common component CSS
- ❌ Using generic class names that may conflict
- ❌ Adding unrestricted media queries or global selectors

**Safe CSS Modification Pattern**:
```css
/* ✅ Correct: Component-specific CSS Modules */
.specificPageContainer { /* Inside DeliveryList.module.css */
  width: 100%;
  max-width: 1200px;
}

/* ❌ Wrong: Global impact */
.container { /* Affects other pages' container */
  width: 100%;
}
```

**Validation Commands**:
```bash
# Check CSS class usage (mandatory before modification)
grep -r "className" src/ | grep "[class-to-modify]"
grep -r "styles\." src/ | grep "[class-to-modify]"
```

### Git Safety & Recovery Protocol
- **Incident analysis**: `git reset --hard HEAD~1` causes uncommitted changes loss
- **Prevention**:
  - Always `git add . && git commit -m "checkpoint"` before major changes
  - Use `git stash` instead of `git reset`
  - Immediately commit CLAUDE.md changes
- **Recovery procedure**: `git stash` → work → use `git stash pop` on issues
- **Dangerous commands**: `git reset --hard`, `git clean -fd` require stash or commit first

### Deletion Safety Protocol
- **Git checkpoint only**: Single commit before major deletions (no verbose documentation)
- **Comment over delete**: Use `// DISABLED:` or `/* REMOVED: */` for code removal
- **Simple recovery**: `git reset --hard HEAD~1` command only if needed
- **No backup files**: Avoid creating `.bak` or temporary files

---

## 👥 Team Collaboration

### Team Project Authority Control
**Our Authority Area** (박재엽 Part - Delivery Management):
- `suriname-frontend/src/pages/Delivery/` (DeliveryList, DeliveryRegister, DeliveryAnalytics)
- `suriname-frontend/src/css/Delivery/` (All delivery-related CSS)
- `suriname-frontend/src/pages/Public/DeliveryTracking.jsx` (Customer delivery tracking)
- `suriname-frontend/src/pages/Public/SatisfactionSurvey.jsx` (Satisfaction survey)
- `suriname-frontend/src/css/Public/DeliveryTracking.module.css`
- `suriname-backend/src/main/java/com/suriname/delivery/` (Entire delivery package)

**Absolutely Forbidden Areas** (Other team members):
- Customer-related files (김채연)
- Payment-related files (오세민)
- Request/Repair-related files (심우석)
- Analytics/Dashboard-related files (정은총)
- Staff/Employee-related files (김현민)

**Limited Modification Allowed** (Delivery-related only):
- `App.jsx`: Only delivery route additions/modifications allowed
- `SidebarNavigation.jsx`: Only delivery menu items modification allowed
- Other global files: Prior approval required

**Authority Violation Prevention**:
- Mandatory path check before file modification
- Immediate stop + warning on forbidden area access
- Scope specification required for global file modifications
- Authority area verification before Git commit

### Team Role Distribution
- **김현민**: Authentication, Authorization, Security systems
- **김채연**: Customer management, Excel processing
- **심우석**: A/S request system, SMS notifications
- **오세민**: Payment system, PG integration, virtual accounts
- **박재엽**: Delivery management, shipment tracking
- **정은총**: Analytics, Dashboard, Statistics, Reporting

---

## 🏗️ Project Standards

### Project Structure
This is a comprehensive customer service management system named "Suriname":
- **suriname-backend/**: Spring Boot application with Java 21, Spring Security, JPA, MySQL, JWT authentication
- **suriname-frontend/**: React application built with Vite, React Router, Lucide React icons

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

### API Standards
**CRITICAL**: This project follows specific API design patterns established by the team. All new APIs must conform exactly to these standards.

- **URL Structure**: `/api/{domain}/{resource}` (e.g., `/api/customers`, `/api/payments/virtual-account`)
- **HTTP Methods**: Strict REST compliance (GET/POST/PUT/DELETE)
- **Response Format**:
  - Success: `{"status": 200|201, "data": object}`
  - Error: `{"status": 400|404|500, "message": string}`
- **Pagination**: Query params `?page=0&size=10` (Spring Pageable)
- **Search**: POST method with search criteria in request body
- **File Upload**: Use `multipart/form-data` format

### Database Patterns
- **Entity Relationships**: Use JPA associations (`@OneToMany`, `@ManyToOne`)
- **Enums**: Use `@Enumerated(EnumType.STRING)` for status fields
- **ID Strategy**: `@GeneratedValue(strategy = GenerationType.IDENTITY)`
- **Specifications**: Use Criteria API for dynamic queries

### Security Patterns
- **JWT**: Token-based authentication with role checking
- **CORS**: Configured for localhost:5173 only
- **Endpoints**: Use `/api/{domain}` pattern consistently

### Domain-Specific Standards
- **Customer Registration**: Combined customer + product registration in single API
- **Soft Delete**: Use `isDeleted` flag, never hard delete
- **Excel Processing**: Support bulk operations with progress tracking
- **Request Numbers**: Auto-generate format `AS-YYYYMMDD-XXX`
- **Payment Integration**: PortOne webhook handling, virtual account creation
- **Status Management**: Enum-based status with transition rules
- **SMS Notifications**: Event-driven messaging for status changes

---

## 🔧 Automation Rules

### Port Management Auto-Execution Rules
**Trigger Keywords**: "포트", "port", "충돌", "conflict", "8081", "5173", "already in use", "뱅뱅", "막힘", "안되는"

**Auto-execution Steps**:
1. `netstat -ano | findstr :[PORT]` - Immediately check port usage process
2. `taskkill //PID [PID] //F` - Force kill process (no approval needed)
3. Auto-restart services (Backend: `./gradlew bootRun`, Frontend: `npm run dev`)

**Batch Cleanup**: "전체 포트 정리" request auto-cleans ports 8080,8081,8082,5173,5174,5175
**Exception**: Production environment or critical system processes require confirmation

### Claude Code Usage Monitor Auto-Execution Rules
**Trigger Keywords**: "토큰", "사용량", "usage", "모니터", "monitor", "사용률", "한도", "limit", "cost", "비용"

- **Auto-execution**: Detect keywords → execute `claude-code-monitor` command automatically
- **Execution Options**: Default real-time monitoring, add `--view daily/monthly` options as needed
- **Exception**: For questions or explanation requests, provide explanation only without running monitor

---

## 📖 Reference Documentation

### Branch Structure
- **main**: Basic project setup
- **develop**: Main development branch with full feature set
- **feature/auth**: JWT authentication and role-based access
- **feature/payment**: PortOne payment integration
- **feature/analytics**: Dashboard and analytics features
- **feature/account**: User account management
- **feat/cp-manage**: Customer management features

### Database Configuration
- MySQL database with JPA entities
- Connection pooling and transaction management
- Custom repository interfaces with Specification pattern for dynamic queries

### API Integration
- Frontend proxy configuration for `/api` routes to `localhost:8081`
- CORS configured for `localhost:5173`
- JWT token handling in request headers

### Development Workflow
1. Start backend: `./gradlew bootRun` from suriname-backend/ (runs on port 8081)
2. Start frontend: `npm run dev` from suriname-frontend/ (runs on port 5173)
3. Access application at http://localhost:5173
4. API documentation available at http://localhost:8081/swagger-ui.html

### Key Technical Features
- **JWT Security**: Token-based authentication with refresh mechanism
- **Excel Processing**: Customer data import/export functionality
- **Real-time Analytics**: Dashboard with business intelligence features
- **Payment Webhooks**: Automated payment status updates
- **File Upload**: Multi-file support with validation
- **Database Relationships**: Complex entity relationships with JPA associations

### Required Response Examples
```json
// Customer registration
{"status": 201, "data": {"customerId": 1, "customerProductId": 10}}

// List operations
{"status": 200, "data": {"content": [...], "totalElements": 120}}

// Error handling
{"status": 400, "message": "고객을 찾을 수 없습니다"}
```

---

**IMPORTANT**: This is a team project. Follow existing patterns and conventions exactly. Do not introduce new rules or modify existing architecture without team approval.