<div align="center">

# 🛡️ JobShield

### AI-Powered Job Scam Detection Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-environment-variables">Environment</a> •
  <a href="#-api-endpoints">API Specs</a> •
  <a href="#-contributing">Contributing</a>
</p>

[GitHub Repository](https://github.com/nagarajhelava9353dk-ship-it/jobshield) • [Report Issue](https://github.com/nagarajhelava9353dk-ship-it/jobshield/issues)

</div>

---

## 🌟 Overview

**JobShield** is an enterprise-grade job fraud prevention and scam detection platform designed to protect job seekers from malicious employment schemes, phantom listings, and advance-fee recruitment scams.

By combining modern **Spring Boot 4 / Java 17** microservices, high-performance **React 19**, and state-of-the-art **Google Gemini AI**, JobShield analyzes job posting texts and documents in real time, calculating an explainable risk score (`0-100`), flagging suspicious indicators, and aggregating intelligence on active scam campaigns.

---

## ✨ Key Features

- 🔍 **Instant AI Threat Scanning**: Scan job postings against real-world scam patterns in milliseconds using Google Gemini AI.
- 🎯 **Predictive Risk Scoring**: Receive an explainable `0-100` risk index categorized into **LOW**, **MEDIUM**, or **HIGH** risk.
- 🚩 **Contextual Fraud Markers**: Automatically flags upfront payment requests, check overpayments, WhatsApp/Telegram-only communications, and unverified domains.
- 🔐 **Hardened JWT Authentication**: Secure role-based access control (RBAC) supporting `USER`, `RECRUITER`, and `ADMIN` personas.
- 📊 **Scam Intelligence Feed**: Aggregated view of active fraud campaigns and repeat scam patterns.
- ⚡ **Zero-CORS Client Architecture**: Pre-configured Vite reverse proxy forwarding seamlessly to Spring Boot REST endpoints.
- 🎨 **Modern Cyber-Security UI**: Sleek dark-mode glassmorphic aesthetic built with custom design tokens and Tailwind CSS.
- 🚀 **Cloud Ready**: Configured for seamless deployment on **Vercel** (Frontend) and **Render / Railway** (Backend).

---

## 🔄 How It Works

```
[Job Posting / Offer] ──> [JobShield Web App (React 19)] ──> [Spring Boot REST API] ──> [Gemini AI Engine]
                                                                     │                        │
                                                                     ▼                        ▼
                                                           [PostgreSQL / Supabase]   [Risk Score & Reasons]
```

1. **Submission**: User submits a job posting URL, raw text, or offer letter.
2. **Sanitization & Enrichment**: Spring Boot validates payloads and fetches historical fraud telemetry.
3. **AI Inference**: The backend sends structured prompts to **Google Gemini** to evaluate red flags and linguistic deceptive markers.
4. **Scoring & Persistence**: The analysis produces an explicit risk score, summary, and action items, stored securely in PostgreSQL.
5. **Real-Time Visual Insight**: The dashboard visualizes the confidence score with warning badges and safe application guidance.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State & Data**: Axios with JWT Interceptors, React Hook Form, Yup
- **Styling**: Tailwind CSS & Glassmorphism Design System
- **Hosting**: [Vercel](https://vercel.com/) (pre-configured with `vercel.json` rewrite rules)

### Backend
- **Core**: [Spring Boot 4](https://spring.io/) / [Java 17 OpenJDK](https://adoptium.net/)
- **Security**: Spring Security + Stateless JWT Filter
- **Persistence**: Spring Data JPA + Hibernate ORM + Flyway Migrations
- **Database**: [PostgreSQL](https://www.postgresql.org/) / [Supabase](https://supabase.com/)
- **Connection Pool**: HikariCP

### AI & Integration
- **LLM Engine**: [Google Gemini / OpenRouter](https://ai.google.dev/)
- **HTTP Client**: Spring Boot `RestClient`

---

## 🚀 Quick Start

### Prerequisites
- **Java**: JDK 17 or later (`java -version`)
- **Node.js**: v18 or later (`node -v`)
- **Database**: PostgreSQL (or Supabase instance)
- **AI Key**: Google Gemini API key or OpenRouter key

---

### 1. Clone the Repository

```bash
git clone https://github.com/nagarajhelava9353dk-ship-it/jobshield.git
cd jobshield
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd jobshield-backend
   ```
2. Configure credentials in `src/main/resources/application.properties` (or set environment variables):
   ```properties
   spring.datasource.url=jdbc:postgresql://<HOST>:<PORT>/<DB_NAME>
   spring.datasource.username=<USERNAME>
   spring.datasource.password=<PASSWORD>
   app.jwt.secret=<YOUR_SUPER_SECRET_JWT_KEY>
   openrouter.api.key=<YOUR_AI_KEY>
   ```
3. Run the Spring Boot application:
   ```powershell
   # On Windows
   .\mvnw.cmd spring-boot:run

   # On Linux / macOS
   ./mvnw spring-boot:run
   ```
   *Backend starts on `http://localhost:8081`.*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd jobshield-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from `.env.example`:
   ```env
   VITE_API_BASE_URL=http://localhost:8081
   VITE_APP_NAME=JobShield
   VITE_APP_VERSION=2.0.0
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend is live at `http://localhost:5173`.*

---

## ☁️ Deployment

### Frontend on Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `jobshield-frontend`.
3. Add environment variables:
   - `VITE_API_BASE_URL`: Public URL of your deployed Spring Boot API.
   - `VITE_SUPABASE_URL`: (Optional) Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: (Optional) Supabase public anon key.
4. Deploy! The included `vercel.json` automatically handles SPA client-side routing.

### Backend on Render / Railway
1. Deploy `jobshield-backend` as a Web Service.
2. Build Command: `./mvnw clean package -DskipTests`
3. Start Command: `java -jar target/*.jar`
4. Set database and AI environment variables.

---

## 🔐 Environment Variables

### Backend (`application.properties` or System Environment)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `server.port` | Backend HTTP Port | `8081` |
| `spring.datasource.url` | PostgreSQL JDBC Connection URL | `jdbc:postgresql://<host>:5432/<db>` |
| `spring.datasource.username` | Database username | `postgres` |
| `spring.datasource.password` | Database password | `******` |
| `app.jwt.secret` | Secret key for JWT signing | `Base64/Hex 256-bit string` |
| `app.jwt.expiration` | Token validity duration | `86400000` (24h in ms) |
| `openrouter.api.key` | AI Provider API Key | `sk-or-v1-...` |

### Frontend (`.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Spring Boot Backend Base URL | `http://localhost:8081` |
| `VITE_APP_NAME` | Application Title | `JobShield` |
| `VITE_APP_VERSION` | Application Version | `2.0.0` |

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/change-password` — Change password

### 🛡️ Analysis Engine (`/api/jobs`)
- `POST /api/jobs/analyze` — Analyze job posting description and calculate risk score
- `GET /api/jobs/history` — Get paginated scan history for authenticated user
- `GET /api/jobs/history/{id}` — Get single analysis report detail

### 📊 Scam Campaigns (`/api/campaigns`)
- `GET /api/campaigns` — Fetch intelligence feeds on known scam operations
- `GET /api/campaigns/{id}` — Fetch detailed campaign indicators

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
