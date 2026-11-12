# AI Global Job Hunter

> **Fully Automated AI-Powered Global Job Discovery and Tracking Platform**  
> Specifically engineered for freshers and early-career IT/software candidates (0–2 years maximum experience policy).

---

## 🚀 Key Features

1. **Automated Continuous Discovery**: Discovers IT and software opportunities across permitted public platforms (Greenhouse Job Board API, Lever Postings API, and official career feeds) respecting rate limits and robots policies.
2. **Deterministic Eligibility Engine**:
   - Strictly enforces the **0–2 years maximum experience policy**.
   - Accepts: 0 years, 0–1 years, 0–2 years, internships, graduate trainees, entry-level, junior, and associate roles.
   - Rejects: Mandatory experience > 2 years (including 3+ years and 1–3 years mandatory).
   - Review Flagging: Unclear, missing, or conflicting requirements receive `NEEDS_REVIEW` instead of false positives.
   - Categorization: Restricts ingestion to relevant IT/software engineering domains.
3. **AI Job Understanding & 100-Point Match Score**:
   - Provider abstraction supporting **Google Gemini API** (`gemini-1.5-flash`) and **OpenAI API** (`gpt-4o-mini`).
   - Weighted match score (0–100):
     - Technical skills: **35%**
     - Education eligibility: **20%**
     - Experience eligibility: **20%**
     - Role relevance: **15%**
     - Location preference: **10%**
   - Detailed strengths, gap analysis, and candidate-specific AI recommendations.
   - **Retention Policy**: Every eligible job is retained regardless of match score. Match scores are strictly used for ranking.
4. **Duplicate Prevention & Verification**:
   - Multi-tier deduplication by Source ID + External ID, Canonical URL, and Normalized Company/Title Similarity.
   - Preserves source attribution and direct company application links.
   - Periodic verification detects expired or closed postings without deleting audit records.
5. **Gmail Daily Digest**:
   - Integrated with Google Gmail API using OAuth 2.0 with minimal outbound-only permission (`gmail.send`).
   - AES-256 encrypted refresh tokens at rest.
   - Dispatches formatted HTML & plain-text daily digest grouped by country and sorted by match score.
   - Idempotent delivery batches prevent duplicate notifications.
6. **Full-Stack Production React Dashboard**:
   - React + Vite + Tailwind CSS + Lucide React + Recharts.
   - Pages: Dashboard Overview, All Jobs, Job Details, AI Recommendations, Country Explorer, Job Sources, Saved Jobs, Application Tracker, Gmail Notifications, Candidate Profile, Agent Settings, System Logs.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 3, Lucide React, Recharts, React Router 6.
- **Backend API**: Node.js v24, Express 4, Prisma ORM, Helmet, CORS, bcryptjs, jsonwebtoken, Zod.
- **Background Workers**: Redis, BullMQ (7 decoupled pipeline queues), node-cron.
- **Database**: PostgreSQL 17 (schema with 21 relational models and Prisma migrations).
- **AI Providers**: Google Gemini API (`@google/genai`), OpenAI API (`gpt-4o-mini`).
- **Notification**: Google Gmail API (`googleapis`).

---

## 📂 Project Structure

```text
ai-global-job-hunter/
├── client/                     # React + Vite Frontend Dashboard
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, Reusable widgets
│   │   ├── layouts/            # AppLayout shell
│   │   ├── pages/              # 12 Core dashboard pages
│   │   ├── context/            # AuthContext & state providers
│   │   └── services/           # Axios REST API client
│   └── vite.config.js
├── server/                     # Express REST API Server
│   ├── prisma/
│   │   └── schema.prisma       # 21 Data models & relationships
│   ├── src/
│   │   ├── collectors/         # Greenhouse, Lever, Career Page adapters
│   │   ├── modules/            # Eligibility, AI, Matching, Duplicates, Notifications
│   │   ├── middleware/         # Auth, Error handling, Rate limiting
│   │   └── app.js              # Express application assembly
├── worker/                     # BullMQ Background Processing Workers
│   └── src/
│       ├── queues/             # 7 decoupled stage queues
│       └── worker.js           # Automated pipeline runner
├── shared/                     # Shared Constants, Schemas, & Validators
│   ├── constants/              # IT roles, Eligibility rules, Weights, Sources
│   └── validators/             # Zod schemas for jobs, profiles, AI payloads
├── tests/                      # Automated Test Suite (Node.js Test Runner)
│   ├── unit/                   # Eligibility, Normalization, Matching, Duplicate tests
│   └── integration/            # REST API integration tests
├── docker-compose.yml          # PostgreSQL 17 + Redis 7 + API + Worker
└── .env.example                # Standard environment configuration
```

---

## ⚡ Quick Start

### 1. Environment Configuration

```bash
cp .env.example .env
```

Configure your `.env` with your API keys (`GEMINI_API_KEY` or `OPENAI_API_KEY`, and Google OAuth credentials).

### 2. Running Automated Tests

```bash
npm test
```

Runs all 31 unit and integration tests across:
- `tests/unit/eligibility.test.js` (12 tests)
- `tests/unit/normalization.test.js` (3 tests)
- `tests/unit/matching.test.js` (3 tests)
- `tests/unit/duplicates.test.js` (4 tests)
- `tests/integration/api.test.js` (9 tests)

### 3. Running with Docker Compose

```bash
docker compose up -d
```

Starts:
- PostgreSQL 17 on `:5432`
- Redis 7 Alpine on `:6379`
- API Server on `:5000`
- Background Worker

### 4. Running Locally in Development

```bash
# Start backend API
npm --prefix server run dev

# Start background worker
npm --prefix worker run dev

# Start frontend dashboard
npm --prefix client run dev
```

Visit `http://localhost:5173` to explore the dashboard.

---

## 🧪 Testing Verification Highlights

- **Strict Maximum Experience Policy**:
  - `0 years`, `0-1 years`, `0-2 years`, and `Internships` -> `ELIGIBLE`.
  - `3 years mandatory` -> `INELIGIBLE`.
  - `1-3 years mandatory` -> `INELIGIBLE`.
  - `2 years mandatory + 3 years preferred` -> `ELIGIBLE`.
  - Missing or conflicting requirements -> `NEEDS_REVIEW`.
- **Match Score Policy**:
  - Scores range from 0 to 100 according to exact weightings (35/20/20/15/10).
  - Low-scoring jobs remain visible and filterable; never pruned.
- **Deduplication**:
  - Source ID + External ID, Canonical URL, and Normalized Title Similarity deduplicated seamlessly.

