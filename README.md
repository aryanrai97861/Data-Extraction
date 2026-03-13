# ⚡ ExtractIQ — Structured Data Extraction Tool

A full-stack application that extracts structured JSON data from unstructured text. Upload **PDFs, DOCX, or TXT** files (or paste raw text) and choose between **Regex-based** or **Gemini AI-based** extraction.

---

## 🎯 Features

- **File Upload** — Drag & drop or browse to upload PDF, DOCX, DOC, and TXT files
- **Text Paste** — Paste raw text directly for quick extraction
- **Dual Extraction Modes:**
  - 🔍 **Regex** — Fast, offline, pattern-based extraction (no API key needed)
  - 🤖 **AI (Gemini)** — Context-aware, smart extraction using Google Gemini
- **Structured JSON Output** — Clean, formatted JSON with field-level cards
- **Copy to Clipboard** — One-click copy of extracted JSON
- **Raw Text Preview** — Toggle between JSON and raw text views

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React, TypeScript, Vite                 |
| Backend   | Node.js, Express, TypeScript            |
| AI        | Google Gemini API (`gemini-2.5-flash`)  |
| File Parsing | `pdf-parse`, `mammoth`, `multer`     |

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.ts                # Express server entry point
│   │   ├── routes/
│   │   │   └── extract.ts          # POST /api/extract endpoint
│   │   ├── services/
│   │   │   ├── fileParser.ts       # PDF, DOCX, TXT parsing
│   │   │   ├── regexExtractor.ts   # Regex-based extraction engine
│   │   │   └── aiExtractor.ts      # Gemini AI-based extraction engine
│   │   └── types/
│   │       └── index.ts            # TypeScript interfaces
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── App.tsx                  # Main application component
    │   ├── App.css                  # Premium dark theme styles
    │   └── components/
    │       ├── FileUpload.tsx       # Drag & drop file upload
    │       ├── TextInput.tsx        # Text paste area
    │       ├── ModeSelector.tsx     # Regex / AI toggle
    │       └── ResultsDisplay.tsx   # JSON viewer & field cards
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- Google Gemini API key (only needed for AI mode)

### 1. Clone the repository

```bash
git clone https://github.com/aryanrai97861/Data-Extraction.git
cd Data-Extraction
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
PORT=5000
GEMINI_API_KEY=your_actual_api_key_here
```

Start the backend:

```bash
npm run dev
```

The server runs at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

---

## 📡 API Reference

### `POST /api/extract`

Extracts structured data from text or uploaded files.

**Request** (multipart/form-data):

| Field  | Type   | Required | Description                              |
|--------|--------|----------|------------------------------------------|
| `file` | File   | No       | PDF, DOCX, DOC, or TXT file              |
| `text` | String | No       | Raw text to extract from                 |
| `mode` | String | Yes      | `"regex"` or `"ai"`                      |

> At least one of `file` or `text` must be provided.

**Response:**

```json
{
  "success": true,
  "data": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "skills": ["React", "Node.js", "Python"],
    "experience": "2 years"
  },
  "mode": "regex",
  "rawText": "Name: Rahul Sharma\nEmail: rahul@example.com\n..."
}
```

### `GET /api/health`

Health check endpoint. Returns `{ "status": "ok" }`.

---

## 🔍 Regex Extraction — Supported Fields

The regex engine extracts the following fields:

| Category         | Fields Detected                                                |
|------------------|----------------------------------------------------------------|
| **Personal**     | Name, Email, Phone, Address, Date of Birth                     |
| **Links**        | LinkedIn, GitHub, Portfolio/Website                            |
| **Professional** | Skills, Experience, Company, Summary/Objective                 |
| **Education**    | Education, Training, Courses, Certifications                   |
| **Resume Sections** | Projects, Achievements, Languages, Interests, Volunteering, Publications, Activities |
| **Invoice**      | Invoice Number, Date, Total/Amount                             |

It uses a two-phase approach:
1. **Inline matching** — Detects `Label: Value` patterns (e.g., `Name: John Doe`)
2. **Section parsing** — Detects multi-line blocks under headers (e.g., `Skills` followed by bullet points)

---

## 🤖 AI Extraction

When using AI mode, the text is sent to **Google Gemini** with a carefully crafted prompt that instructs the model to:
- Return only valid JSON
- Use `snake_case` keys
- Extract all identifiable structured fields
- Use arrays for multi-value fields

> **Note:** AI mode requires a valid `GEMINI_API_KEY` in your `.env` file.

---

## 📝 Example

**Input (pasted text):**
```
Rahul Sharma
Email: rahul@example.com
Phone: +91 9876543210

Skills
React, Node.js, Python, TypeScript

Experience
Software Developer at TechCorp (2022–2024)
Built REST APIs and React dashboards

Projects
E-commerce Platform — Full-stack app with payment integration
Chat App — Real-time messaging using Socket.io
```

**Output (Regex mode):**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+91 9876543210",
  "skills": ["React", "Node.js", "Python", "TypeScript"],
  "experience_details": [
    "Software Developer at TechCorp (2022–2024)",
    "Built REST APIs and React dashboards"
  ],
  "projects": [
    "E-commerce Platform — Full-stack app with payment integration",
    "Chat App — Real-time messaging using Socket.io"
  ]
}
```

---

## 📄 License

MIT
