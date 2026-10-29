# Brightcone HR Portal

Enterprise Human Resource Management System (HRMS) featuring a unified full-stack architecture with a high-performance **Rust (Loco.rs)** backend and an interactive **React + TypeScript + Tailwind CSS** frontend.

---

## Architecture & Directory Layout

```
Brightcone-HR-Portal/
├── API/       # Backend API built with Rust (Loco.rs, SeaORM, PostgreSQL)
└── UI/        # Frontend Single Page Application built with React, Vite, TypeScript, Tailwind
```

---

## Modules & Features

1. **People Operations & Directory**
   - Employee Profiles, Org Hierarchy, Department Directories
   - Onboarding & Offboarding Workflows, New Joiners Tracking
   - Access Cards & Badges, Document Management, Exit Management
   - Performance Reviews, Probation Tracking & Reviews, Appraisal Tracker

2. **Time & Attendance**
   - Shift Rostering & Scheduling, Weekly Shift Roster
   - Daily Attendance & Biometric/Punch In-Out Tracking
   - Leave Requests, Balance Calculators, Leave Types & Leave Quotas Admin
   - Work From Home (WFH) & Comp-Off Requests, Holiday Calendars, Shift Swaps

3. **Recruitment (ATS)**
   - Job Openings & Pipeline Management
   - Candidate Tracking, Resume Parsing, Interview Scheduling
   - Offer Letters & Joining Formalities, Campus Drives & Internship Management

4. **Payroll & Finance**
   - Salary Structures, Salary Revisions, Payroll Runs & Variances
   - Statutory Compliance (PF, ESI, TDS) & Register
   - Employee Expense Claims & Approvals, Finance Disbursements

5. **Learning & Development (L&D)**
   - Course Catalog, Mandatory Compliance & Security Training
   - Skills Matrix, Skill Gap Analysis & AI Learning Recommendations
   - Employee Training Completion Tracking

6. **Executive Suite & Administration**
   - Executive Suite Dashboard & Dynamic KPI Cards
   - Central Approvals Inbox (Leave, Expenses, Promotions, Badges)
   - Real-Time Reports & Headcount Analytics, Workforce & Diversity Analytics
   - Performance Management & Promotion Proposals
   - HR Compliance Dashboard & Rule Enforcement
   - Role-Based Access Control (RBAC) & Security Policies
   - Tamper-Evident Audit Logs & Data Backup Snapshots (CSV/JSON)

7. **Brightcone Connect & Digital Signatures**
   - Social Feed, Announcements, Polls, Kudos & Feedback
   - Digital Document Signing & Envelope Workflows

---

## Getting Started

### Prerequisites
- Node.js (v18+) & npm
- Rust & Cargo
- PostgreSQL (v15+) with database `brightcone_hr_portal`

### Running the Backend (API)
```bash
cd API
cargo run -- start
```
*API runs on `http://127.0.0.1:5155`.*

### Running the Frontend (UI)
```bash
cd UI
npm install
npm run dev
```
*UI runs on `http://localhost:3000`.*
