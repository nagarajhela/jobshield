# Changelog

All notable changes to the **JobShield** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-19

### 🚀 Initial Release

JobShield v1.0.0 marks the initial open-source release of the AI-powered job scam detection platform.

#### Added
- **AI Scam Evaluation Engine**:
  - Direct integration with Google Gemini Flash API for natural language job description processing.
  - Automatic computation of scam risk index (`0-100`), threat level categorization (`LOW`, `MEDIUM`, `HIGH`), and detailed threat breakdown.
- **Backend Architecture (Spring Boot & Java 17)**:
  - Spring Security with custom `JwtAuthenticationFilter` for stateless authentication.
  - Role-based authorization (`USER`, `RECRUITER`, `ADMIN`).
  - Spring Data JPA entities for users, job analyses, and scam campaigns.
  - Global exception handling (`GlobalExceptionHandler`) for bean validation and business errors.
- **Frontend UI (React 19 & Vite)**:
  - Responsive Cyber-Glassmorphism dark theme using custom CSS variable tokens.
  - Landing page with live statistics and feature highlights.
  - Dedicated Authentication portal (Sign In & Registration).
  - Real-time Job Analysis workspace with instant risk gauge and flag breakdowns.
  - PDF Scanner interface for analyzing uploaded offer letters.
  - Scam Intelligence Campaign dashboard.
  - Vite dev server reverse proxy for seamless local API communication.
- **Database (MySQL 8.0)**:
  - Relational schema with tables: `users`, `job_analysis`, `scam_campaign`.
  - Automatic migration and HikariCP connection pooling.

#### Fixed & Hardened
- **Validation Tuning**: Adjusted user registration name constraints to allow valid 1-to-50 character single-letter names and initials.
- **Database Field Expansion**: Altered `users.phone_number` to `VARCHAR(50)` to comfortably support international formats with prefixes and spaces without data truncation.
- **Security**: Added robust `.gitignore` policies safeguarding local database credentials and environment files.
