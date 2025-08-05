# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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