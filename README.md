# VerityAI – AI-Powered Brand Governance & Advertisement Compliance System

**VerityAI** is an AI-powered brand governance platform designed to help organizations review advertisements against their brand guidelines, product information, approved marketing claims, and supporting documents.

The system combines a structured PostgreSQL database, a FastAPI backend, a React frontend, and Google's Gemini AI to identify potential brand conflicts, unsupported advertising claims, and content requiring further review.

**LIVE LINK** - https://brand-governace-verityai.vercel.app 


---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-project-objectives)
4. [Key Features](#4-key-features)
5. [Technology Stack](#5-technology-stack)
6. [System Architecture](#6-system-architecture)
7. [Database Design](#7-database-design)
8. [AI Integration](#8-ai-integration)
9. [Project Structure](#9-project-structure)
10. [Quick Start](#10-quick-start)
11. [Environment Configuration](#11-environment-configuration)
12. [Running the Application](#12-running-the-application)
13. [API Documentation](#13-api-documentation)
14. [Advertisement Analysis Workflow](#14-advertisement-analysis-workflow)
15. [Deployment](#15-deployment)
16. [Security Considerations](#16-security-considerations)
17. [Limitations](#17-limitations)
18. [Future Enhancements](#18-future-enhancements)
19. [Contributing](#19-contributing)
20. [License](#20-license)

---

## 1. Project Overview

Organizations maintain specific brand identities, marketing guidelines, product specifications, and approved advertising claims. However, manually reviewing every advertisement against these requirements can be time-consuming and prone to inconsistencies.

VerityAI addresses this challenge through an AI-assisted advertisement review system.

Organizations can maintain their business information, brands, product details, approved claims, brand guidelines, and supporting documents within a centralized platform.

When an advertisement is submitted, the system evaluates its content against the available organizational and product references.

Gemini AI provides contextual analysis and identifies:

- Potential violations of brand guidelines.
- Unsupported or unverified advertising claims.
- Statements matching approved marketing claims.
- Content requiring additional evidence.
- Suggested corrections and recommendations.

The system generates a structured analysis report to support human reviewers in making informed publication decisions.

## 2. Problem Statement

Organizations often face difficulties maintaining consistency and accuracy across advertisements created for different products and marketing campaigns.

Manual advertisement verification can result in:

- Inconsistent brand communication.
- Use of restricted or inappropriate phrases.
- Unsupported product claims.
- Incorrect or misleading marketing statements.
- Difficulty accessing approved product information.
- Time-consuming document verification.

VerityAI aims to simplify this process by combining centralized brand information, evidence-based checks, and AI-assisted advertisement analysis.

## 3. Project Objectives

- Develop a centralized platform for managing organizations and brands.
- Maintain product specifications and approved marketing claims.
- Store and manage brand guidelines and supporting documents.
- Extract searchable text from uploaded PDF documents.
- Integrate Gemini AI for contextual advertisement analysis.
- Identify potential brand guideline conflicts.
- Detect advertising statements that lack supporting evidence.
- Generate structured findings and suggested corrections.
- Support human review before advertisement publication.

## 4. Key Features

### 4.1 Organization Management

- Store organization legal names.
- Maintain industry information.
- Configure country and target market details.
- Store organization descriptions.
- Associate multiple brands with an organization.

### 4.2 Brand Management

- Create and manage brands.
- Associate brands with organizations.
- Maintain brand-specific guidelines.
- Manage brand-related products and documents.

### 4.3 Brand Guideline Management

Store important brand communication requirements, including:

- Voice and tone.
- Preferred terminology.
- Restricted phrases.
- Visual identity notes.
- Guideline versions.
- Approval status.

### 4.4 Product Management

Maintain product-related information such as:

- Product name.
- SKU.
- Product category.
- Product specifications.
- Associated brand.

### 4.5 Approved Marketing Claims

- Store product-related marketing claims.
- Maintain claim approval status.
- Associate claims with supporting documents.
- Maintain effective and review dates.

### 4.6 Document Management

- Upload supporting PDF documents.
- Associate documents with brands and products.
- Maintain document approval status.
- Extract selectable text from PDFs.
- Use approved document content as supporting reference information.

### 4.7 AI-Powered Advertisement Analysis

Gemini AI analyzes submitted advertisements using available organizational, brand, and product information.

The analysis includes:

- Claim identification.
- Brand guideline comparison.
- Approved claim comparison.
- Product specification comparison.
- Supporting evidence review.
- Risk assessment.
- Suggested corrections.

### 4.8 Structured Analysis Results

The advertisement analysis provides:

- Overall status.
- Risk level.
- Summary.
- Individual findings.
- Evidence sources.
- Suggested corrections.
- Analysis limitations.

## 5. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Frontend build tool | Vite |
| Backend | Python |
| Backend framework | FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database migrations | Alembic |
| AI integration | Google Gemini API |
| AI Python SDK | google-genai |
| PDF text extraction | pypdf |
| Configuration | pydantic-settings / environment variables |
| API testing | Swagger UI |
| Backend hosting | Render |
| Frontend hosting | Vercel |
| Database hosting | Neon PostgreSQL |

## 6. System Architecture

The application follows a frontend-backend-database architecture with an external AI integration.

```text
                 USER
                   |
                   v
          REACT + VITE FRONTEND
                   |
                   | HTTP / REST API
                   v
             FASTAPI BACKEND
                   |
          +--------+---------+
          |                  |
          v                  v
     POSTGRESQL          GEMINI AI
       DATABASE          INTEGRATION
          |                  |
          v                  v
   Organization Data     AI Analysis
   Brand Information     Risk Assessment
   Product Details       Findings
   Approved Claims       Recommendations
   Guidelines
   Documents
          |
          v
     PDF TEXT EXTRACTION
```

### Architecture Description

**Frontend:** Provides the user interface for managing organizational information, products, documents, guidelines, and advertisement submissions.

**Backend:** Handles API requests, database operations, document processing, advertisement verification, and Gemini integration.

**Database:** Stores structured organizational, brand, product, claim, guideline, and document information.

**Gemini AI:** Performs contextual analysis using the information retrieved by the backend.

**PDF Processing:** Extracts selectable text from approved PDF documents to make supporting information available during advertisement analysis.

## 7. Database Design

VerityAI uses PostgreSQL to maintain structured information.

### Main Database Entities

| Entity | Description |
|---|---|
| Organization | Stores organization information |
| Brand | Stores brands associated with organizations |
| BrandGuideline | Stores brand communication requirements |
| Product | Stores product details and specifications |
| ApprovedClaim | Stores product-related marketing claims |
| Document | Stores supporting document information and uploaded PDF content |

### Entity Relationships

```text
Organization
    |
    | 1 : Many
    v
Brand
    |
    +--------------------+
    |                    |
    v                    v
BrandGuideline         Product
                         |
                         v
                    ApprovedClaim

Brand
    |
    v
Document
```

A brand belongs to an organization and can have multiple guidelines, products, and documents.

A product belongs to a brand and can have multiple approved claims.

Documents can be associated with a specific product or with the entire brand.

## 8. AI Integration

VerityAI integrates Google's Gemini API using the official `google-genai` Python SDK.

### Why Gemini?

Gemini is used to provide contextual reasoning beyond exact text matching.

The system supplies relevant information to the AI model, including:

- Organization details.
- Brand name.
- Product name.
- Product specifications.
- Approved brand guidelines.
- Approved marketing claims.
- Extracted text from approved supporting documents.
- Advertisement text submitted for analysis.

### AI Analysis Process

1. The backend receives the advertisement text and product ID.
2. The selected product and associated brand information are retrieved.
3. Approved claims and approved guidelines are collected.
4. Relevant approved documents are retrieved.
5. PDF text is extracted where possible.
6. The collected information is passed to Gemini.
7. Gemini returns a structured JSON analysis.
8. The backend validates and returns the result.

### Analysis Statuses

| Status | Meaning |
|---|---|
| issues_found | A potential guideline conflict or serious issue was detected |
| needs_review | One or more statements require further verification |
| matched_reference | Available reference information was matched without identified material conflicts |

### Risk Levels

| Risk | Meaning |
|---|---|
| High | Potentially serious brand guideline conflict |
| Medium | Claims or statements require further review |
| Low | No significant issue identified in the available references |

**Important:** AI-generated assessments are recommendations, not proof of factual accuracy or legal compliance. Final publication decisions require appropriate human review.

## 9. Project Structure

The project is organized into separate frontend and backend directories.

```text
VerityAI/
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── documents.py
│   │   │       ├── gudielines.py
│   │   │       ├── organizations.py
│   │   │       ├── products.py
│   │   │       └── governance.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── document.py
│   │   │   ├── guideline.py
│   │   │   ├── organization.py
│   │   │   └── product.py
│   │   │
│   │   ├── schemas/
│   │   │
│   │   ├── services/
│   │   │   ├── document_service.py
│   │   │   ├── text_extraction.py
│   │   │   ├── governance_service.py
│   │   │   └── gemini_service.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── test_gemini.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

*Note: The structure above represents the known project layout. Additional files and folders may exist in your implementation.*

## 10. Quick Start

Follow these instructions to run VerityAI locally.

### Prerequisites

Install the following:

- Python 3.11 or a compatible supported version.
- Node.js and npm.
- PostgreSQL.
- Git.
- A Google Gemini API key.

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/VerityAI.git
cd VerityAI
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 2: Set Up the Backend

Open a terminal:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Install Gemini SDK if it is not already listed in requirements:

```bash
pip install google-genai
```

### Step 3: Configure Environment Variables

Create a `.env` file inside the backend directory, starting from `backend/.env.example`.

Example:

```env
APP_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql+psycopg://<user>:<password>@<host>:5432/<database>
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
JWT_SECRET_KEY=
```

Replace placeholders with your actual configuration. Generate a unique `JWT_SECRET_KEY` for each environment.

Do not commit `.env` to GitHub.

### Step 4: Set Up the Database

Create a PostgreSQL database named:

```sql
CREATE DATABASE verityai;
```

Configure the database connection string in `.env`.

If your project uses Alembic migrations, apply them using:

```bash
alembic upgrade head
```

Run migrations from the directory containing your Alembic configuration.

### Step 5: Start the Backend

From the backend directory, run:

```bash
uvicorn app.main:app --reload
```

If your FastAPI entry point is `backend/main.py` instead, use:

```bash
uvicorn main:app --reload
```

Backend development URL:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### Step 6: Start the Frontend

Open a second terminal:

```bash
cd frontend
```

Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` to the backend API's base URL.

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal, commonly:

```text
http://localhost:5173
```

### Step 7: Verify Gemini Connection

From the backend directory, run the Gemini connection test:

```bash
python test_gemini.py
```

Expected output includes:

```text
Testing Gemini...
Model: gemini-2.0-flash
SUCCESS
Response: <generated response>
Time taken: <seconds> seconds
```

This verifies the standalone Gemini API connection. The advertisement analysis endpoint must be tested separately.

## 11. Environment Configuration

The backend and frontend use environment variables for database access, Gemini integration, CORS, and API routing.

| Variable | Purpose |
|---|---|
| DATABASE_URL | PostgreSQL database connection |
| GEMINI_API_KEY | Google Gemini API authentication |
| GEMINI_MODEL | Gemini model identifier |
| FRONTEND_URL | Deployed frontend origin, where used by backend CORS configuration |
| APP_ENV | Set to `production` for a deployed backend |
| JWT_SECRET_KEY | Secret used to sign authentication tokens |
| VITE_API_BASE_URL | Frontend build-time backend API base URL |

Additional variables may be required by your authentication, configuration, and deployment implementation.

Never publish real API keys, passwords, or authentication secrets.

## 12. Running the Application

### Local Development

Run the backend and frontend in separate terminals.

**Backend:**

```bash
cd backend
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm run dev
```

The frontend communicates with the backend through its configured API base URL.

### Backend API Testing

Open:

```text
http://127.0.0.1:8000/docs
```

Use Swagger UI to inspect available endpoints and test API requests.

## 13. API Documentation

VerityAI exposes REST APIs through FastAPI.

The currently implemented API modules include:

| API Module | Purpose |
|---|---|
| Organizations | Organization management |
| Guidelines | Brand guideline management |
| Products | Product management |
| Documents | Document upload and management |
| Governance | Advertisement analysis |

### Advertisement Analysis

**Endpoint:** `POST /api/governance/analyze`

The analysis endpoint accepts a product ID and advertisement text.

Example request:

```json
{
  "product_id": 1,
  "advertisement_text": "Our biscuits contain zero sugar and are perfect for everyone."
}
```

Example response structure:

```json
{
  "product_id": 1,
  "product_name": "Classic Biscuits",
  "overall_status": "needs_review",
  "risk_level": "medium",
  "summary": "The advertisement requires further verification.",
  "findings": [
    {
      "claim_text": "Our biscuits contain zero sugar",
      "status": "unverified",
      "severity": "medium",
      "explanation": "The available supporting references do not establish this claim.",
      "source": null,
      "suggested_correction": "Review the statement against supporting evidence."
    }
  ],
  "limitations": [
    "Human review is required before publication."
  ]
}
```

*The response above illustrates the API structure; actual findings depend on the stored information and AI analysis.*

For complete request and response schemas, refer to the Swagger documentation.

## 14. Advertisement Analysis Workflow

The general advertisement verification workflow is:

```text
Start
  |
  v
Select Organization / Brand / Product
  |
  v
Enter Advertisement Text
  |
  v
Retrieve Product Information
  |
  v
Retrieve Approved Guidelines
  |
  v
Retrieve Approved Claims
  |
  v
Retrieve Approved Documents
  |
  v
Extract PDF Text
  |
  v
Send Evidence + Advertisement to Gemini
  |
  v
Analyze Advertisement
  |
  v
Generate Structured Findings
  |
  v
Display Risk Level and Recommendations
  |
  v
Human Review
  |
  v
End
```

Only approved information should be treated as approved evidence. Pending records should not be considered approved merely because they are stored in the database.

## 15. Deployment

VerityAI can be deployed using separate hosting services.

| Component | Hosting Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| PostgreSQL | Neon |
| AI | Google Gemini API |

### Frontend Deployment

1. Push the frontend project to GitHub.
2. Import the repository into Vercel.
3. Configure the frontend root directory.
4. Configure the Vite build command as `npm run build`.
5. Set `VITE_API_BASE_URL` to the deployed backend's base URL.
6. Deploy the application.

### Backend Deployment

1. Connect the GitHub repository to Render.
2. Configure the backend root directory.
3. Install dependencies.
4. Configure the Uvicorn start command.
5. Set `APP_ENV=production`, `DATABASE_URL`, `FRONTEND_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, and a unique `JWT_SECRET_KEY`.
6. Deploy the FastAPI service.

Example start command when the entry point is `backend/app/main.py`:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Database Deployment

1. Create a PostgreSQL database on Neon.
2. Configure the database connection URL in Render.
3. Apply database migrations.
4. Migrate required existing records and documents.
5. Verify backend database connectivity.

### Production URLs

After deployment, update the following with your actual URLs:

```text
Frontend: https://YOUR-FRONTEND-URL
Backend:  https://YOUR-BACKEND-URL
API Docs: https://YOUR-BACKEND-URL/docs
Database: Hosted PostgreSQL connection
```

## 16. Security Considerations

- Keep Gemini API keys in backend environment variables.
- Never expose database credentials in frontend code.
- Do not commit `.env` files to GitHub.
- Configure CORS to allow only trusted frontend origins.
- Validate advertisement input and uploaded files.
- Restrict access to organizational information based on user authorization.
- Validate file types and file sizes.
- Use HTTPS in production.
- Keep database backups.
- Treat AI-generated results as recommendations requiring human verification.

## 17. Limitations

- Gemini analysis depends on the quality and completeness of the supplied information.
- AI-generated results may require manual verification.
- A wording match does not prove that an advertising claim is factually true.
- PDF extraction currently supports selectable text; scanned or image-only PDFs require OCR.
- Pending claims and documents must not be treated as approved evidence.
- The system does not independently guarantee legal or regulatory compliance.
- Gemini API usage is subject to Google's model availability, quota, and pricing policies.
- Production reliability depends on hosting resources and database configuration.

## 18. Future Enhancements

Potential improvements include:

1. Role-based access control for administrators and reviewers.
2. OCR support for scanned documents.
3. Advanced evidence retrieval and semantic document search.
4. Automated brand guideline version comparison.
5. Advertisement approval and rejection workflow.
6. Detailed audit logs and review history.
7. Multi-language advertisement analysis.
8. Image and video advertisement review.
9. Regulatory compliance reference management.
10. Advanced reporting and analytics dashboards.
11. Automated notifications for pending reviews.
12. More detailed explanation of AI-generated findings and evidence references.

## 19. Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Implement your changes.
4. Test the changes locally.
5. Submit a pull request with a clear description.

Example:

```bash
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

## 20. License

Choose and add an appropriate open-source license before distributing this project publicly.

---

## Project Summary

**VerityAI – AI-Powered Brand Governance & Advertisement Compliance System**

VerityAI brings together organizational information, brand guidelines, product specifications, approved marketing claims, supporting documents, and Gemini AI to support consistent and evidence-based advertisement reviews.

The platform aims to reduce manual verification effort, identify potential brand conflicts, and help organizations make better-informed advertising publication decisions.

**Built with React, FastAPI, PostgreSQL, and Google Gemini AI.**
