<div align="center">

# 🛡️ JobShield

### AI-Powered Job Scam Detection Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-environment-variables">Environment</a> •
  <a href="#-api-endpoints">API Specs</a> •
  <a href="#-contributing">Contributing</a>
</p>

[Live Demo: Coming Soon](https://github.com) • [Report Bug](https://github.com) • [Request Feature](https://github.com)

</div>

---

## 📸 Demo & Screenshots

<div align="center">
  <p><em>(Add your demo GIF / UI screenshot here: <code>docs/screenshots/hero-banner.png</code>)</em></p>
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</div>

---

## 🌟 Overview

**JobShield** is a full-stack, enterprise-grade job fraud prevention platform designed to protect applicants from malicious employment schemes, phantom listings, and advance-fee scams. 

By combining modern **Spring Boot 4 / Java 17** microservices, high-performance **React 19**, and state-of-the-art **Google Gemini AI**, JobShield parses job text and offers real-time scoring, contextual threat flags, and fraud risk classification.

---

## ✨ Key Features

- 🔍 **Instant AI Threat Scanning**: Evaluate job descriptions against known scam patterns in milliseconds using Google Gemini.
- 🎯 **Predictive Risk Scoring**: Receive an explainable `0-100` risk index categorized into **LOW**, **MEDIUM**, or **HIGH** risk.
- 🚩 **Contextual Fraud Markers**: Highlights suspicious requests (e.g., upfront fees, check overpayments, WhatsApp/Telegram-only communications, unofficial domains).
- 🔐 **Hardened JWT Authentication**: Secure role-based access control (RBAC) supporting `USER`, `RECRUITER`, and `ADMIN` personas.
- 📊 **Scam Intelligence Feed**: Aggregated view of active fraud campaigns and repeat offender recruitment patterns.
- ⚡ **Zero-CORS Architecture**: Pre-configured Vite reverse proxy forwarding seamlessly to Spring Boot REST endpoints.
- 🎨 **Modern Cyber-Security UI**: Sleek dark-mode glassmorphic aesthetic built with a lightweight custom CSS token system.

---

## 🔄 How It Works

```
[Job Posting / Offer] ──> [JobShield Web App] ──> [Spring Boot REST API] ──> [Gemini AI Engine]
                                                               │                    │
                                                               ▼                    ▼
                                                      [MySQL Local Store]   [Risk Score & Reasons]
```

1. **Submission**: User pastes raw job posting text or uploads an offer document.
2. **Sanitization & Enrichment**: Spring Boot validates payloads and fetches historical fraud telemetry.
3. **AI Inference**: The backend sends structured prompts to **Google Gemini** to evaluate red flags and linguistic deceptive markers.
4. **Scoring & Persistence**: The analysis produces an explicit risk score, summary, and action items, stored securely in MySQL.
5. **Real-Time Visual Insight**: The dashboard visualizes the confidence score with warning badges and safe application guidance.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: Vanilla CSS Design Tokens (Glassmorphism & Responsive Grid)

### Backend
- **Core**: [Spring Boot 4.1.0](https://spring.io/) / [Java 17 OpenJDK](https://adoptium.net/)
- **Security**: Spring Security + Stateless JWT Filter
- **Persistence**: Spring Data JPA + Hibernate ORM
- **Database**: [MySQL 8.0](https://www.mysql.com/) with HikariCP Connection Pooling

### AI & Integration
- **LLM Engine**: [Google Gemini 2.5 Flash / Gemini 3.6 Flash](https://ai.google.dev/)
- **HTTP Client**: Spring Boot `RestClient`

---

## 🚀 Quick Start

### Prerequisites
- **Java**: JDK 17 or later (`java -version`)
- **Node.js**: v18 or later (`node -v`)
- **MySQL Server**: 8.0+ running on port 3306
- **Google Gemini API Key**: [Get one here](https://aistudio.google.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/[YOUR-USERNAME]/JobShield.git
cd JobShield
```

---

### 2. Database Setup

Open MySQL CLI or MySQL Workbench:
```sql
CREATE DATABASE IF NOT EXISTS jobshield_db;
```

---

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd jobshield-backend
   ```
2. Configure credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/jobshield_db
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   gemini.api.key=YOUR_GEMINI_API_KEY
   ```
3. Run the Spring Boot application:
   ```bash
   # On Windows PowerShell
   .\mvnw.cmd spring-boot:run

   # On Linux / macOS
   ./mvnw spring-boot:run
   ```
   *Backend starts on `http://localhost:8081`.*

---

### 4. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd jobshield-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend is live at `http://localhost:5173`.*

---

## 🔐 Environment Variables

### Backend (`application.properties` or System Environment)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `SERVER_PORT` | Backend HTTP Port | `8081` |
| `DB_URL` | MySQL JDBC Connection URL | `jdbc:mysql://localhost:3306/jobshield_db` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `YOUR_PASSWORD` |
| `JWT_SECRET` | Secret key for JWT signing | `Hex/Base64 256-bit string` |
| `JWT_EXPIRATION` | Token validity duration | `86400000` (24h in ms) |
| `GEMINI_API_KEY` | Google AI Studio Key | `AQ.Ab8...` or `AIzaSy...` |

### Frontend (`.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend Target URL | `http://localhost:8081` |
| `VITE_APP_NAME` | Web Application Header | `JobShield` |

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | ❌ No |
| `POST` | `/api/auth/login` | Login and obtain JWT token | ❌ No |

### Job Analysis (`/api/jobs`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/jobs/analyze` | Submit job text for scam evaluation | ✅ Yes (`USER`) |
| `GET` | `/api/jobs/history` | Retrieve user's previous scan history | ✅ Yes (`USER`) |
| `GET` | `/api/jobs/{id}` | Get specific analysis details | ✅ Yes (`USER`) |

### Campaign Intelligence (`/api/campaigns`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/campaigns` | List active scam patterns & campaigns | ✅ Yes (`USER`/`ADMIN`) |

---

## 🤝 Contributing

Contributions make the open-source community thrive! Any contributions you make are **greatly appreciated**.

Please review our [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming conventions, PR guidelines, and code style rules.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🛡️ Security

We take security seriously. If you discover a vulnerability within JobShield, please review our [SECURITY.md](SECURITY.md) for disclosure guidelines.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 👤 Author & Contact

**Manoj**
- 🐙 GitHub: [@Manoj-np](https://github.com/Manoj-np)
- 🔗 Repository: [JobShield-AI-Powered-Job-Scam-Detection-Platform](https://github.com/Manoj-np/JobShield-AI-Powered-Job-Scam-Detection-Platform)

---

<div align="center">
  <sub>Built with ❤️ using React 19, Spring Boot, and Google Gemini AI.</sub>
</div>
