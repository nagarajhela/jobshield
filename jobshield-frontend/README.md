# JobShield — AI-Powered Job Scam Detector (Frontend)

JobShield is a modern, lightweight cybersecurity web application designed to protect job seekers from deceptive employment offers, fee extortion schemes, and coordinated scam syndicates.

> **Backend Integrity Confirmation**:  
> The backend application in `jobshield-backend/` was **not modified in any way**. All Java controllers, entities, DTOs, Spring Security filters, and properties remain completely untouched. This frontend was constructed to connect strictly to the existing API contracts.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + Vite
- **Routing**: `react-router-dom`
- **Styling**: Pure CSS (Cybersecurity Dark / Navy theme with HIGH/MEDIUM/LOW risk color-coding)
- **HTTP Client**: Native browser `fetch` with token injection and proxy support

---

## 🚀 Setup & Execution Instructions

### Step 1: Ensure Backend is Running
The Spring Boot backend must be running on `http://localhost:8081`.
```bash
# From jobshield-backend/ directory (using Maven):
./mvnw spring-boot:run
# Or launch JobshieldBackendApplication.java from IntelliJ / Eclipse
```

### Step 2: Configure Environment Variables
Inside `jobshield-frontend/`, an `.env` file is pre-configured with:
```env
VITE_API_BASE_URL=http://localhost:8081
```

### Step 3: Install Dependencies & Run Frontend
```bash
cd jobshield-frontend
npm install
npm run dev
```
The application will be available at: **`http://localhost:5173`**

*(Note: `vite.config.js` is also configured with a dev proxy for `/api` pointing to `http://localhost:8081`, ensuring zero browser CORS issues during development).*

---

## 🔄 Complete User Workflow

1. **Explore Landing Page (`/`)**:
   - Discover JobShield's AI capabilities, scam pattern matching, and how it works.
2. **Register an Account (`/register`)**:
   - Provide your First Name, Last Name, Email, Password ($\ge 8$ chars), and optional phone number.
   - Posts to `POST /api/auth/register`.
3. **Log In (`/login`)**:
   - Enter your email and password.
   - Posts to `POST /api/auth/login`, retrieves your JWT bearer token, and stores it securely in `localStorage` under `jobshield_token`.
4. **View Dashboard (`/dashboard`)**:
   - Automatically loads `GET /api/jobs/dashboard`.
   - Displays real-time counts for Total Scans, High Risk, Medium Risk, and Low Risk alerts with a CSS progress distribution breakdown.
5. **Analyze a Job Description (`/analyze`)**:
   - Enter Company Name, Job Title, Salary, and paste the job description text.
   - Posts to `POST /api/jobs/analyze`.
   - Calls Google Gemini AI model (`gemini-3.6-flash`), evaluates scam patterns (FEE, WHATSAPP, TELEGRAM, URGENT), calculates Jaccard similarity, and returns a detailed Risk Score (0-100), risk tier, reason, and cluster information.
6. **Scan PDF Offer Letter (`/scan-pdf`)**:
   - Drag & drop or browse a `.pdf` offer letter (up to 10MB).
   - Sends a `multipart/form-data` request with key `file` to `POST /api/jobs/analyze-pdf`.
   - Apache PDFBox extracts the raw text and runs the identical scam evaluation pipeline.
7. **Inspect History & Full Details (`/history`)**:
   - View your scanned postings table (or mobile cards).
   - Click **View Details** on any record to call `GET /api/jobs/{analysisId}` and inspect the full modal report.
8. **Track Scam Campaigns (`/campaigns`)**:
   - View coordinated fraud rings identified via `GET /api/jobs/campaigns` that reuse deceptive templates across different fake company names.
9. **Log Out**:
   - Clears the JWT token and redirects to `/login`.

---

## 📡 Connected Backend Endpoints

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register new user account |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & get JWT |
| **Auth** | `GET` | `/api/auth/me` | Fetch active user profile |
| **Jobs** | `POST` | `/api/jobs/analyze` | Run Gemini AI scam analysis on text |
| **Jobs** | `POST` | `/api/jobs/analyze-pdf`| Extract & scan PDF offer letter (`file`) |
| **Jobs** | `GET` | `/api/jobs/dashboard` | Fetch total, high, medium, low risk counts |
| **Jobs** | `GET` | `/api/jobs/history` | Retrieve logged-in user scan history |
| **Jobs** | `GET` | `/api/jobs/{analysisId}` | Retrieve single scan details |
| **Jobs** | `GET` | `/api/jobs/campaigns` | Fetch grouped syndicate scam campaigns |
