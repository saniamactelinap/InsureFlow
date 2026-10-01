# InsureFlow — Smart Insurance Claim Processing and Settlement Management System

> A secure, role-based MERN web application streamlining the end-to-end insurance claim lifecycle from incident filing to multi-stage investigation, managerial approval, and financial settlement execution.

---

## 1. Problem Statement

Traditional insurance claim processing often suffers from:
* **Manual and Fragmented Workflows:** Claim documents, physical inspection notes, and settlement approvals are exchanged across disconnected spreadsheets, paper records, and email chains.
* **Opacity and Customer Friction:** Policyholders have limited visibility into the operational progress of their claims, leading to anxiety, repetitive support inquiries, and prolonged turnaround times.
* **Inconsistent Review & Risk Exposure:** Disparate handoffs between claims officers, independent field surveyors, and financial managers increase processing oversights, unauthorized status changes, and fraud exposure.
* **Audit Trail Deficits:** Absence of immutable, centralized transition history makes compliance auditing and accountability verification cumbersome.

---

## 2. Solution: The Digital Claim Lifecycle

**InsureFlow** provides a centralized, digital-first claim management platform with strict Role-Based Access Control (RBAC) across five specialized stakeholder roles. Every claim moves through an audited, verifiable lifecycle:

```text
Policyholder Submits Claim
           ↓
Document Upload (RC, Invoices, FIR, Photos)
           ↓
Insurance Officer Verifies Documents
           ↓
Officer Assigns Licensed Surveyor
           ↓
Surveyor Inspects Loss & Submits Survey Report
           ↓
Manager Reviews Claim & Survey Findings
           ↓
Manager Decision (Approve / Reject / Request Information)
           ↓
Officer / Manager Initiates Settlement
           ↓
Settlement Processing & Bank Transfer Finalization
           ↓
Claim Status Transitioned to Settled
           ↓
Manager / Admin Formally Closes Claim
           ↓
Complete Audit Trail & Automated Notifications Persisted
```

---

## 3. Implemented Tech Stack

### Frontend
* **React.js (v18)** — Component-driven declarative UI
* **Vite** — High-speed build tool and optimized asset pipeline with route-level code splitting (`React.lazy` + `Suspense`)
* **Tailwind CSS** — Enterprise design system and responsive utility styling
* **React Router DOM (v6)** — Client-side declarative routing and protected role gates
* **Axios** — HTTP client with centralized JWT interceptors
* **Lucide React** — Unified iconography

### Backend
* **Node.js** — JavaScript server runtime
* **Express.js** — Modular RESTful API architecture
* **JSON Web Tokens (JWT)** — Stateless role-based authentication and secure session tokens
* **bcryptjs** — Salted password hashing
* **Multer** — Secure multipart form-data handling for claim document uploads (PDF, PNG, JPG, JPEG with 5 MB caps)

### Database
* **MongoDB Atlas** — Cloud NoSQL document database
* **Mongoose (v8)** — Schema modeling, relational population, validations, and query execution

### API Architecture
* **REST API** — Standardized JSON request/response conventions, semantic HTTP status codes, and centralized error handling

### Development & Operational Tools
* **Git & GitHub** — Version control and codebase checkpointing
* **VS Code** — Code editing and terminal orchestration
* **Postman** — API validation and endpoint sanity testing

---

## 4. System Architecture

```text
+-----------------------------------------------------------+
|                      React Frontend                       |
|   (Customer, Officer, Surveyor, Manager, Admin Portals)   |
+-----------------------------------------------------------+
                             │
                  REST API (JSON over HTTP)
                             │
+-----------------------------------------------------------+
|                   Node.js + Express Backend               |
|  - JWT Authentication Middleware                          |
|  - Role-Based Access Control (RBAC Guard)                 |
|  - Modular Routers & Controllers                          |
|  - Multer Secure File Processing                          |
|  - Audit Trail & Notification Generators                  |
+-----------------------------------------------------------+
                             │
                    Mongoose ORM Layer
                             │
+-----------------------------------------------------------+
|                      MongoDB Atlas                        |
|  - Users, Policies, Claims, Documents, Surveys,          |
|    Approvals, Settlements, Notifications, ClaimHistory    |
+-----------------------------------------------------------+
```

---

## 5. Stakeholder Roles & Access Control

InsureFlow enforces strict separation of concerns on both the client (via `ProtectedRoute` allowed roles) and server (via `protect` and `authorizeRoles` middlewares):

| Role | Responsibilities & Permissions | Restrictions |
| :--- | :--- | :--- |
| **Customer** | View owned policies; file new claims; upload supporting documents; inspect real-time claim status and audit timeline; review settlements; manage profile. | Forbidden from accessing staff operations, administrative tools, system user registries, or other users' data (HTTP 403). |
| **Insurance Officer** | Review submitted claims; inspect and certify/reject uploaded documents; assign licensed field surveyors; initiate financial settlements once approved. | Forbidden from approving/rejecting claims, finalizing settlement closures, or accessing user administration (HTTP 403). |
| **Surveyor** | View assigned inspection requests; conduct physical or loss evaluations; submit formal survey reports with estimated loss figures and recommendations. | Forbidden from approving claims, modifying settlements, verifying documents, or viewing unassigned records (HTTP 403). |
| **Claims Manager** | Review completed survey findings and document dossiers; render official approval decisions (Approve, Reject, Request Information); finalize and close settlements. | Forbidden from creating system policies or accessing system-wide user role administration (HTTP 403). |
| **System Admin** | Comprehensive administrative supervision; manage user accounts and role assignments; create and configure insurance policies; oversee all claims, surveys, approvals, and financial logs. | Retains complete governance access across all operational modules. |

---

## 6. Main Features (Implemented)

* **Multi-Portal Experience:** Dedicated, tailored dashboards for Customer, Officer, Surveyor, Manager, and Admin roles.
* **Policy Management:** Policy creation, customer assignment, policy details, coverage limits, and premium schedules.
* **Self-Service Claim Filing:** Guided multi-step claim submission linked directly to active policies with incident timestamping and damage descriptions.
* **Document Verification Hub:** Multi-file document uploads (FIR, medical bills, repair estimates, damage photos) with inline status indicators (Pending, Verified, Rejected).
* **Surveyor Assignment & Field Inspection:** Officer assignment of certified surveyors, tracking of inspection locations, damage assessments, and estimated loss valuations.
* **Multi-Tier Manager Approvals:** Strict validation requiring claims to be investigated before approval; validation ensuring approved amounts never exceed claimed amounts.
* **Settlement Execution:** End-to-end payment processing supporting Bank Transfers, Cheques, and Digital Transfers with transaction reference tracking and formal claim closure.
* **Audit History Timeline:** Automatic, immutable `ClaimHistory` logging recording every state change, actor role, timestamp, and review remarks.
* **Notification System:** Event-triggered notifications for all key milestones (filing, assignment, verification, approval, payout, closure) with read/unread tracking and batch actions.
* **Performance & Accessibility:** Route-level code splitting using `React.lazy` and `Suspense`, lazy-loaded below-the-fold imagery, semantic HTML, visible focus states, and reduced-motion compliance.

---

## 7. REST API Endpoints Overview

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new customer account
* `POST /api/auth/login` — Authenticate and receive a signed JWT token
* `GET /api/auth/profile` — Fetch current authenticated user profile

### User Administration (`/api/users`) — *Admin Only*
* `GET /api/users` — Retrieve all system users (filtered by role/status)
* `GET /api/users/:id` — Retrieve specific user details

### Policies (`/api/policies`)
* `GET /api/policies` — List policies (customer sees own; staff/admin see all)
* `GET /api/policies/:id` — Get policy by ID
* `POST /api/policies` — Create new policy (*Admin only*)
* `PUT /api/policies/:id` — Update policy (*Admin only*)
* `DELETE /api/policies/:id` — Delete policy (*Admin only*)

### Claims (`/api/claims`)
* `POST /api/claims` — Submit a new claim (*Customer only*)
* `GET /api/claims` — List claims (scoped by role and assignment)
* `GET /api/claims/:id` — Retrieve full claim dossier
* `GET /api/claims/:id/history` — Retrieve chronological audit trail
* `PUT /api/claims/:id/assign-surveyor` — Assign surveyor (*Officer, Manager, Admin*)
* `PUT /api/claims/:id/approval` — Manager decision on claim (*Manager, Admin*)

### Documents (`/api/documents`)
* `POST /api/documents/upload` — Upload claim document (*Customer, Officer*)
* `GET /api/documents/claim/:claimId` — List all documents for a claim
* `PUT /api/documents/:id/verify` — Verify or reject document (*Officer, Admin*)

### Surveys (`/api/surveys`)
* `GET /api/surveys/assigned` — Retrieve claims assigned to logged-in surveyor
* `POST /api/surveys` — Submit survey report (*Surveyor only*)
* `GET /api/surveys` — List survey reports
* `GET /api/surveys/:id` — Get survey report details

### Approvals (`/api/approvals`)
* `GET /api/approvals` — List all manager approval records
* `GET /api/approvals/:id` — Get approval details

### Settlements (`/api/settlements`)
* `POST /api/settlements` — Initiate claim settlement (*Officer, Manager, Admin*)
* `GET /api/settlements` — List settlements
* `GET /api/settlements/:id` — Get settlement details
* `PUT /api/settlements/:id/status` — Update payment status (*Officer, Manager, Admin*)
* `PUT /api/settlements/:id/close` — Finalize and close claim (*Manager, Admin*)

### Notifications (`/api/notifications`)
* `GET /api/notifications` — Get user notifications
* `PUT /api/notifications/:id/read` — Mark notification as read
* `PUT /api/notifications/read-all` — Mark all notifications as read

---

## 8. Local Setup & Installation

### Prerequisites
* **Node.js:** v18.x or later installed
* **MongoDB:** An active MongoDB Atlas connection URI or local MongoDB instance
* **Git:** Version control installed

### 1. Clone the Repository
```bash
git clone https://github.com/saniamactelinap/InsureFlow.git
cd InsureFlow
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file from the provided example:
   ```bash
   cp .env.example .env
   ```
4. Configure environment variables in `.env` (see section below).
5. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend will boot on `http://localhost:5000` with MongoDB Atlas connected.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will run on `http://localhost:5173`.*

### 4. Production Build Verification
To compile the optimized, production-ready frontend bundle:
```bash
cd frontend
npm run build
```

---

## 9. Environment Variables Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/insureflow?retryWrites=true&w=majority

# JWT Authentication Secret Key
JWT_SECRET=your_jwt_secret_key_here_min_32_characters

# Application Port
PORT=5000
```

> **Security Note:** Never commit `.env` files or credentials into version control. Ensure `.env` remains in `.gitignore`.

---

## 10. Future Enhancements

The following roadmap items are planned for future major iterations and are currently intentionally separated from the core release:

* **AI/OCR Document Extraction:** Automated field extraction from medical discharge summaries, driving licenses, and repair bills.
* **Automated Fraud Detection:** Rule-based and anomaly-scoring flags detecting duplicate invoices or suspicious incident timing.
* **AI Chatbot Support Assistant:** Conversational self-service assistant guiding policyholders through claim document requirements.
* **Real-Time WebSocket Updates:** Bi-directional push notifications eliminating page refreshes for instant status synchronization.
* **Advanced Actuarial & Executive Analytics:** Interactive forecasting charts tracking loss ratios, claim frequency, and surveyor turnaround benchmarks.

---

## 11. License & Academic Attribution

This project was engineered as a comprehensive Full-Stack Web Development Capstone Project. Developed with professional software engineering principles, robust authorization security, and industry-standard insurance workflows.
