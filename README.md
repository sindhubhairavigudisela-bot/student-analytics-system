# Academix Pro - Student Performance Analytics & Early Intervention System

A comprehensive, production-minded academic analytics web platform engineered to help educators and academic coordinators understand student performance, identify learning gaps, track chronological trajectories, and deliver transparent, evidence-based academic interventions.

---

## 1. Problem Statement & Objective

Educational institutions frequently track student examination marks, attendance percentages, and assessments in disconnected spreadsheets. Manually reviewing thousands of rows makes it arduous to detect subtle downward performance trends, spot isolated subject-level struggles, or take early pedagogical action before high-stakes summative exams.

**Academix Pro** solves this by:
1. Consolidating academic records into a normalized, long-format assessment data model.
2. Computing transparent academic indicators with explicit denominators.
3. Tracking individual and cohort-level performance over chronological time.
4. Detecting learning gaps and performance declines using explainable, rule-based alerts.
5. Suggesting constructive pedagogical interventions based strictly on empirical evidence.
6. Providing drag-and-drop CSV and Excel (.xlsx) file import with row-by-row validation.
7. Generating downloadable CSV reports and printable PDF documents.
8. Providing a decoupled, leakage-free Python Machine Learning architecture for predictive extension.

> **Ethical Principle:** The system acts strictly as an educator decision-support tool. It never labels a student as incapable, never infers unverified psychological causes, and never makes automated consequential academic decisions without human review.

---

## 2. Technical Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | Component-driven UI with strong compile-time type safety |
| **Bundler & Tooling** | Vite 8 + `@tailwindcss/vite` | Instant HMR and optimized production bundles |
| **Styling & Theme** | Tailwind CSS v4 | Dark navy foundation (`#090d16`), violet accents, glassmorphic panels |
| **Data Visualization** | Recharts 3 | Responsive SVG charts (Bar, Area, Horizontal Bins, Scatter) |
| **Iconography** | Lucide React | Modern, accessible UI icons |
| **File Parsing** | Papa Parse & SheetJS (XLSX) | Streaming CSV and Excel spreadsheet ingestion |
| **Automated Testing** | Vitest | Fast unit and integration test runner for calculations & validation |
| **ML Extension Service** | Python 3.12, scikit-learn, pandas, FastAPI | Decoupled ML pipeline with `GroupKFold` cross-validation |

---

## 3. Architecture & Directory Organization

```
student-analytics-system/
├── src/
│   ├── types/
│   │   └── index.ts                 # Central data models and domain types
│   ├── analytics/
│   │   ├── calculations.ts          # Pure mathematical calculation functions
│   │   ├── warnings.ts              # Explainable rule-based early warning detector
│   │   ├── interventions.ts         # Pedagogical academic intervention generator
│   │   └── calculations.test.ts     # Automated unit test suite
│   ├── validation/
│   │   ├── schema.ts                # Auto-detection column synonyms dictionary
│   │   ├── importer.ts              # CSV/XLSX parser and row-level validator
│   │   └── importer.test.ts         # Import and duplicate validation tests
│   ├── data/
│   │   ├── sampleDataset.ts         # Fictional multi-class, multi-subject dataset
│   │   └── templateData.ts          # Downloadable CSV template generator
│   ├── context/
│   │   └── AcademicDataContext.tsx  # Central state provider with localStorage persistence
│   ├── components/
│   │   ├── common/                  # Reusable Badges, Modals, KpiCards, EmptyStates
│   │   ├── layout/                  # Sidebar navigation, AppHeader, Responsive layout
│   │   └── dashboard/               # Recharts visualization modules and At-Risk table
│   ├── pages/
│   │   ├── OverviewPage.tsx         # Dashboard with 6 KPIs and 4 interactive charts
│   │   ├── StudentsPage.tsx         # Searchable, filterable, sortable student directory
│   │   ├── StudentProfilePage.tsx   # 360° student history, trends, and action plans
│   │   ├── InsightsPage.tsx         # Early warning dispatch hub with review actions
│   │   ├── DataManagementPage.tsx   # Drag & drop file import, mapping, and validation
│   │   └── ReportsSettingsPage.tsx  # Printable reports, CSV exports, and threshold settings
│   ├── App.tsx                      # Root application layout
│   ├── index.css                    # Tailwind CSS v4 configuration
│   └── main.tsx                     # React entrypoint
├── ml_service/                      # Decoupled Python Machine Learning microservice
│   ├── train_model.py               # Leakage-free GroupKFold ML training pipeline
│   ├── api.py                       # FastAPI inference server
│   ├── requirements.txt             # Python dependencies
│   └── README_ML.md                 # ML documentation and evaluation benchmark
├── package.json
└── vite.config.ts
```

---

## 4. Key Pages & Features

### Page 1: Academic Performance Overview
- **6 Key Academic Indicator Cards:** Total Unique Students, Cohort Average %, Pass Rate %, Average Attendance %, Graded Submissions count, and Students Requiring Review.
- **Subject-Wise Performance:** Bar chart displaying normalized percentages by subject with institutional passing reference line.
- **Performance Trajectory Over Time:** Chronological progression area chart.
- **Cohort Score Distribution:** Horizontal bar chart binned into critical (<40%), review (40-59%), competent (60-74%), proficient (75-89%), and exemplary (90-100%).
- **Attendance vs. Academic Performance Map:** Cross-sectional scatter chart with explicit disclaimer that correlation does not establish causation.
- **Students Requiring Review Table:** Direct action table to inspect flagged students.

### Page 2: Student Directory & Roster
- Searchable by student ID or name.
- Filterable by Class / Cohort and Academic Standing (Critical, Review, Proficient, Flagged).
- Sortable by Student Name, Class, Overall Score, Attendance, or Trajectory.
- Paginated table with direct navigation to student profiles.

### Page 3: Individual Student Academic Profile (360° View)
- Quick student switcher dropdown.
- Identity header with cumulative metrics, attendance rate, and trajectory badge.
- Chronological score trajectory line chart.
- Subject-level breakdown progress bars comparing student scores to passing benchmarks.
- Transparent early warnings with exact evidence recorded and underlying rule description.
- Constructive pedagogical intervention plan with actionable revision steps.
- Complete historical assessment ledger table.

### Page 4: Insights & Early Warning Hub
- Rule-based detection across 5 distinct categories:
  1. **Low Performance:** Triggered when cumulative percentage < configured threshold.
  2. **Declining Trajectory:** Triggered when sequential score drops by $\ge 10\%$ delta across comparable assessments.
  3. **Subject Learning Gap:** Identifies subjects where a student scores $\ge 15\%$ below their own overall standing.
  4. **Attendance Review:** Flags presence rates below configured attendance threshold.
  5. **Incomplete Records:** Flags absent, unsubmitted, or missing records without distorting them into zero scores.
- Interactive status toggle: Teachers can mark warnings as reviewed (persisted in browser `localStorage`).
- Interactive rule transparency modal explaining every calculation formula.

### Page 5: Data Management & File Import
- Drag-and-drop ingestion of `.csv`, `.xlsx`, and `.xls` spreadsheets.
- Automatic column detection via smart synonym matching.
- Row-level validation checking: missing IDs/names, negative marks, marks exceeding max marks, invalid dates, out-of-range attendance, and duplicate assessment entries.
- Row-level error inspector table showing exact row index, field name, and problematic raw value.
- Import confirmation modal supporting **"Replace Active Dataset"** or **"Append to Active Dataset"**.
- One-click Download CSV template and one-click Load Fictional Demo dataset.

### Page 6: Reports & System Settings
- **Report Generator:** Generates formatted reports for Comprehensive Cohort Performance, Early Intervention Roster, Subject Analytics, and Assessment Ledger.
- Export as CSV with applied filters included.
- Print / Save as PDF mode (`window.print()` formatted for clean printouts).
- **Settings Form:** Real-time configurable thresholds for Passing Mark, Low Performance, Decline Delta, Subject Gap, and Attendance Review. Updating settings instantly recalculates the entire dashboard!

---

## 5. Normalized Data Model & Schema

Each row in the internal engine represents one student's result for one subject and one assessment (long-format schema):

| Field | Type | Description |
|---|---|---|
| `student_id` | `string` | Unique identifier (e.g. `STU-1001`) |
| `student_name` | `string` | Full student name |
| `class_name` | `string` | Cohort or grade section (e.g. `Grade 10-A`) |
| `subject` | `string` | Academic discipline (e.g. `Mathematics`) |
| `assessment_name` | `string` | Evaluation identifier (e.g. `Midterm Exam`) |
| `assessment_date` | `string \| null` | ISO date `YYYY-MM-DD` |
| `marks_obtained` | `number \| null` | Numerical score obtained (null if unscored) |
| `max_marks` | `number` | Strictly positive maximum score (e.g. 25, 50, 100) |
| `attendance_percentage` | `number \| null` | Documented attendance rate (0 to 100) |
| `result_status` | `ResultStatus` | `graded` \| `absent` \| `missing` \| `not_submitted` \| `not_opted` |

---

## 6. Calculation Definitions

1. **Normalized Percentage Score:**
   $$\text{Score \%} = \frac{\text{marks\_obtained}}{\text{max\_marks}} \times 100 \quad (\text{for valid graded records})$$
2. **Total Unique Students:** Count of unique `student_id` strings within the active filter scope.
3. **Cohort Average:** Mean normalized percentage calculated with an explicit denominator over valid graded records.
4. **Pass Rate:** Percentage of eligible graded results scoring $\ge \text{pass\_threshold}$.
5. **Deduplicated Attendance:** Average computed per distinct student ID, preventing repeated assessments from distorting attendance averages.
6. **Performance Trajectory ($\Delta$):** Chronologically compares sequential assessment rounds. Requires at least 2 distinct assessment periods:
   $$\Delta = \text{Score}_{\text{latest}} - \text{Score}_{\text{earlier}}$$

---

## 7. How to Run Locally

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Installation
```bash
cd student-analytics-system
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Run Automated Tests
```bash
npm test
```
Executes all 15 Vitest unit and integration tests verifying calculation accuracy, edge cases, and row validation.

### 4. Build for Production
```bash
npm run build
```
Compiles TypeScript and creates an optimized production bundle in `dist/`.

---

## 8. Decoupled Machine Learning Service

A standalone Python microservice is included in `ml_service/`:
- **Leakage Prevention:** Uses `GroupKFold` on `student_id` to ensure student records are never partitioned across training and evaluation folds.
- **Models:** Evaluates RandomForestClassifier and Ridge Regressor pipelines using scikit-learn and pandas.
- **FastAPI API:** Exposes `/predict/academic-risk` endpoint for inference.
- See [`ml_service/README_ML.md`](ml_service/README_ML.md) for execution details.

---

## 9. Verification & Acceptance Checklist

- [x] **Page 1: Overview Dashboard:** 6 data-driven KPI cards, 4 Recharts visualizations, at-risk student table, and shared filter bar.
- [x] **Page 2: Student Directory:** Search, class filtering, standing filters, multi-column sorting, and pagination.
- [x] **Page 3: Student Profile:** 360° student history, trajectory line chart, subject breakdown, transparent warnings, and pedagogical interventions.
- [x] **Page 4: Insights & Early Warnings:** Explainable rule-based triggers, evidence display, teacher acknowledgment workflow, and rule transparency modal.
- [x] **Page 5: Data Management:** CSV and XLSX drag-and-drop, schema auto-detection, row-by-row validation, duplicate detection, and import mode confirmation.
- [x] **Page 6: Reports & Settings:** Formatted printable reports, CSV exports, and configurable threshold sliders with live dashboard recalculation.
- [x] **Automated Testing:** 15 Vitest automated test cases covering edge cases (zero marks, missing marks, single assessment, attendance deduplication, negative max marks).
- [x] **Production Build:** Passes TypeScript compilation (`tsc -b`) and Vite production bundle generation cleanly.
- [x] **Decoupled ML Foundation:** Documented Python pipeline and FastAPI microservice with leakage safeguards.
