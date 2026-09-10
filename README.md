# SamadhanSetu (समाधानसेतु)
### National Societal Innovation Platform — Bridging Citizens, Universities & Industry into Scalable Solutions

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://frontend-six-azure-55.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.x-black.svg)](https://expressjs.com/)

🌐 **Live Production Link:** [https://frontend-six-azure-55.vercel.app](https://frontend-six-azure-55.vercel.app)

---

## 📌 Executive Summary

**SamadhanSetu** automates the entire lifecycle of grassroots civic challenges across India. Citizens report localized challenges (water contamination, road infrastructure, rural healthcare access, agricultural logistics), while an AI engine parses, deduplicates, and classifies the reports using dense semantic vector embeddings (`pgvector` / `all-MiniLM-L6-v2`).

Instead of letting grievances stagnate in bureaucratic silos, **SamadhanSetu** dynamically auto-routes each challenge to domain-specific engineering departments across universities (e.g., BIT Mesra, IIT BHU). Academic labs adopt these challenges and submit technical solution blueprints, which are then showcased to corporate sponsors for **CSR co-funding and joint IP ownership** under a standardized digital MoU framework.

---

## 📸 Platform Visual Tour

### 1. Landing Page & Civic Innovation Hero
> Interactive overview of national civic challenges, verified pilot universities, unlocked CSR funding, and AI routing accuracy.
![Landing Page & Civic Innovation Hero](screenshots/01_landing_hero.png)

### 2. Multi-Stakeholder Unified Access Portal
> Role-based authentication gateway supporting Citizens, Universities, Corporate CSR, and Government Administrators with pre-configured verified profiles.
![Multi-Stakeholder Unified Access Portal](screenshots/02_role_login_portal.png)

### 3. Citizen Innovation & Grievance Dashboard
> Multilingual report submission with auto-GPS geotagging, ground photo evidence upload, and live 8-stage convergence lifecycle tracking.
![Citizen Innovation & Grievance Dashboard](screenshots/03_citizen_dashboard.png)

### 4. University R&D & Engineering Labs Hub
> AI-routed challenges with Explainability Cards (semantic match reasoning, priority, affected count) enabling faculty to adopt challenges and upload technical proposals.
![University R&D & Engineering Labs Hub](screenshots/04_university_rd_hub.png)

### 5. Industry CSR & Implementation Portal
> Corporate sustainability dashboard allowing enterprises to discover vetted academic proposals, commit CSR funding, and digitally execute joint IP agreements.
![Industry CSR & Implementation Portal](screenshots/05_industry_csr_portal.png)

---

## 🔄 The 8-Stage Four-Way Convergence Lifecycle

```
[ 1. Submitted ] ──▶ [ 2. Classified ] ──▶ [ 3. Clustered ] ──▶ [ 4. Adopted ]
Citizen report        AI NLP sector          pgvector cosine        University R&D lab
captured & geotagged  & severity score       deduplication          accepts challenge
                                                                           │
                                                                           ▼
[ 8. Resolved ]  ◀── [ 7. Piloted ]    ◀── [ 6. Supported ]   ◀── [ 5. Solution Proposed ]
Permanent municipal   Field trial &         Industry commits CSR   Technical blueprint
deployment verified   validation            grant & executes MoU   & budget submitted
```

| Stage | Name | Description | Key Actors |
|:---:|:---|:---|:---|
| **1** | **Submitted** | Grievance captured with GPS coordinates and photographic evidence. Works offline via IndexedDB sync. | Citizen |
| **2** | **Classified** | Sentence-Transformers model determines sector (Water, Healthcare, Roads, Energy) and computes priority score (0–100). | AI Engine / Queue |
| **3** | **Clustered** | Dense 64-dim vector cosine similarity detects duplicate or adjacent ward grievances, clustering them to amplify impact. | AI Engine / pgvector |
| **4** | **Adopted** | Engineering department (e.g., Civil & Environmental, Electrical) claims ownership and forms a research team. | University Faculty |
| **5** | **Solution Proposed** | Faculty submits technical feasibility blueprint, estimated execution budget, and milestone roadmap. | University R&D Lab |
| **6** | **Industry Supported** | Corporate partner reviews proposal, commits CSR funding, and signs standard joint IP agreement. | Industry CSR Sponsor |
| **7** | **Piloted** | Prototype or field pilot deployed in the affected district with telemetry and municipal oversight. | University & Municipal Body |
| **8** | **Resolved** | Permanent municipal infrastructure completed; citizens receive confirmation and rating prompt. | All Stakeholders |

---

## 👥 Stakeholder Ecosystem & Capabilities

### 🧑‍🤝‍🧑 1. Citizens (Grassroots Level)
- **Multilingual Support**: Real-time interface translation in English, Hindi, and regional languages (Santali, Ho, Khortha/Nagpuri).
- **Auto-GPS Geotagging**: Captures browser geolocation coordinates for precise mapping and cluster density calculation.
- **Ground Photo Evidence**: Uploads physical damage photos with client-side compression and object-storage storage.
- **Offline Resiliency**: PWA-ready queue using browser IndexedDB storage with automatic background replay upon network reconnection.

### 🎓 2. Universities & Technical Institutions
- **AI Explainability Card**: Transparent breakdown showing *Why* a challenge was routed, semantic match score, and affected population count.
- **Challenge Adoption Pipeline**: Instant claim of regional challenges aligned with institutional lab equipment and faculty expertise.
- **Technical Proposal Builder**: Upload project roadmaps, equipment requirements, and itemized CSR budget requests.

### 🏭 3. Industry & CSR Donors
- **Vetted Project Marketplace**: Filter university-backed societal projects by sector, budget, and geographical priority.
- **Staged Funding Workflow**: Move from *Interested* → *Committed* → *Funded* with direct escrow tracking.
- **Standardized Joint IP & MoU**: Pre-negotiated intellectual property framework (50-50 joint patent rights, public domain citizen benefit guarantee).

### 🏛️ 4. Government & Administrative Leadership
- **District Density Heatmaps**: Real-time geographic visualization of civic problem concentration.
- **AI Classification Override**: Administrative authority to manually re-route, adjust severity scores, or merge vector clusters.
- **Cross-Sector Analytics**: Live metrics on CSR deployment volume, university adoption rates, and resolution turnaround times.

---

## 🏗️ Technical Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER (Vite + React 19)            │
│  Tailwind CSS v4  │  Lucide Icons  │  IndexedDB Sync  │  Language Context │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / JSON
┌───────────────────────────────────▼────────────────────────────────────┐
│                    API GATEWAY & SECURITY LAYER                        │
│  Rate Limiting  │  JWT Auth  │  Role-Based Access Control (RBAC)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ Submission Svc   │      │ Collaboration    │      │ Notification Svc │
│ Intake & Evidence│      │ MoU & CSR Grants │      │ WhatsApp / SMS   │
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                         │                         │
         ▼                         ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ASYNCHRONOUS WORKER QUEUE (BullMQ)                   │
│   Job Producer ──▶ Background Worker ──▶ Vector Embedding Pipeline    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                     DATA & EMBEDDING PERSISTENCE                       │
│  Relational Records  │  pgvector Embeddings  │  Local Media Storage   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 REST API Reference

### 🔐 Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token | Public |
| `POST` | `/api/auth/register` | Register new stakeholder account | Public |

### 📝 Problem Submissions
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/problems/submit` | Submit civic problem with photo & GPS | Citizen (Auth) |
| `GET` | `/api/problems` | List all problems with filter parameters | Public |
| `GET` | `/api/problems/:id` | Get single problem with full lifecycle | Public |

### 🤝 University & Industry Collaboration
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/collaboration/adopt` | Adopt challenge by university faculty | University |
| `POST` | `/api/collaboration/proposal` | Submit technical solution proposal | University |
| `POST` | `/api/collaboration/industry-support`| Update CSR commitment stage | Industry |
| `POST` | `/api/collaboration/acknowledge-mou` | Digitally sign joint MoU agreement | University / Industry |

### 📊 Government Admin & Diagnostics
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/analytics` | Fetch district metrics, heatmap, clusters | Admin |
| `POST` | `/api/admin/override-classification` | Override AI category/severity score | Admin |
| `GET` | `/api/notifications` | Get user notifications feed | Authenticated |
| `GET` | `/api/health` | System health check & active service states | Public |

---

## 📂 Project Structure

```
SIH/
├── backend/
│   ├── data/
│   │   └── db.json               # Seeded database state (problems, users, MoUs)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts             # Database layer with pgvector cosine similarity
│   │   │   └── queue.ts          # Resilient BullMQ async worker processor
│   │   ├── controllers/
│   │   │   ├── adminController.ts# Analytics & classification overrides
│   │   │   └── authController.ts # JWT authentication & RBAC validation
│   │   ├── middleware/
│   │   │   └── auth.ts           # Gateway auth & RBAC middleware guards
│   │   ├── models/
│   │   │   └── types.ts          # TypeScript domain models & interfaces
│   │   ├── seeds/
│   │   │   ├── seed.ts           # Database reset & seed runner
│   │   │   └── seedData.ts       # 50+ realistic civic challenges & pilot data
│   │   ├── services/
│   │   │   ├── classification/   # NLP sector & priority scoring
│   │   │   ├── collaboration/    # University adoption & CSR MoU engine
│   │   │   ├── notification/     # SMS & WhatsApp dispatch simulator
│   │   │   ├── routing/          # Semantic department match engine
│   │   │   └── submission/       # Intake pipeline & async worker
│   │   └── server.ts             # Express gateway server entry point
│   ├── .env.example              # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── logo.jpg              # Custom SamadhanSetu brand logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── ExplainabilityCard.tsx       # AI routing explainability modal
│   │   │   ├── HeroDashboard.tsx            # Public landing hero section
│   │   │   ├── MoUModal.tsx                 # Digital MoU agreement modal
│   │   │   ├── Navbar.tsx                   # Top navigation with role switcher
│   │   │   ├── NotificationSimulatorModal.tsx # WhatsApp/SMS live logger
│   │   │   └── PipelineTracker.tsx          # 8-stage visual progress stepper
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx              # Session & user context
│   │   │   └── LanguageContext.tsx          # Multilingual translation dictionary
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx           # Admin analytics & override hub
│   │   │   ├── CitizenDashboard.tsx         # Citizen grievance submission
│   │   │   ├── IndustryDashboard.tsx        # CSR funding & proposal review
│   │   │   ├── LoginPage.tsx                # Role-based credential gateway
│   │   │   └── UniversityDashboard.tsx      # R&D lab challenge adoption
│   │   ├── services/
│   │   │   └── api.ts                       # Axios client & IndexedDB fallback
│   │   ├── App.tsx                          # App routing & root layout
│   │   └── main.tsx                         # Vite application entry
│   ├── package.json
│   └── vite.config.ts
│
├── screenshots/                  # High-resolution platform screenshots
│   ├── 01_landing_hero.png
│   ├── 02_role_login_portal.png
│   ├── 03_citizen_dashboard.png
│   ├── 04_university_rd_hub.png
│   └── 05_industry_csr_portal.png
│
├── .gitignore                    # Git exclusions (node_modules, .env, dist)
└── README.md                     # Comprehensive platform documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher (tested on Node v20/v22/v26)
- npm v9+

### 1. Backend Installation & Startup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Seed the database with 50+ realistic civic challenges & pilot accounts
npm run seed

# Launch backend in development mode (starts on port 5000)
npm run dev
```

### 2. Frontend Installation & Startup
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Launch Vite development server (starts on port 5173)
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🔑 Pre-Configured Demo Credentials

The platform provides ready-to-test profiles for all four stakeholder roles:

| Role | Pre-configured Email | Password | Persona / Organization |
|---|---|---|---|
| **Citizen** | `citizen@samadhansetu.gov.in` | `password123` | Ramesh Kumar Murmu (Citizen, Ward 6 Ranchi) |
| **University** | `university@samadhansetu.gov.in` | `password123` | Prof. Anirudh Sen (BIT Mesra Ranchi) |
| **Industry** | `industry@samadhansetu.gov.in` | `password123` | Vikramaditya Singhania (Tata Trusts) |
| **Admin** | `admin@samadhansetu.gov.in` | `password123` | Suresh Chandra IAS (Municipal Commissioner) |

*You can switch between roles directly in the top navigation bar or log in with custom credentials.*

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=samadhansetu_jwt_secret_key_demo
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# Optional: PostgreSQL + pgvector (falls back to built-in vector engine if unset)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/samadhansetu

# Optional: Redis for BullMQ (falls back to built-in async queue if unset)
# REDIS_URL=redis://localhost:6379

# Optional: SMS & WhatsApp credentials (simulator active by default)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
MSG91_AUTH_KEY=
MSG91_SENDER_ID=
```

---

## 🗺️ Future Roadmap

- [ ] **AI4Bharat IndicNLP Voice Input**: Native speech-to-text allowing citizens to describe grievances in their local dialects via voice note.
- [ ] **Smart Contract MoU Audit Trail**: Optional decentralized consensus layer recording joint IP and CSR disbursement milestones on a public ledger.
- [ ] **Satellite & Drone Computer Vision**: Automated spatial verification of reported road damage or municipal water accumulation using open GIS feeds.
- [ ] **Native Mobile PWA**: Offline-first caching with background sync service workers for ultra-low bandwidth rural zones.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
