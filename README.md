# Arohon

## Rise through smarter learning.

**Arohon** (Bengali: আরোহণ — *ascent, climbing upward, rising to a higher level*) is an AI-powered academic intelligence platform built specifically for **RUET (Rajshahi University of Engineering & Technology)** students to reimagine how they prepare for exams, study course materials, and prioritize their workload.

Instead of just acting as another passive Learning Management System (LMS) that merely stores PDFs, Arohon actively **interprets** academic history, lecture emphasis, and teacher patterns to tell students:
> *"What actually matters for my next exam, why does it matter, and what should I do next?"*

---

## 🚀 2-Minute Demo Flow

1. **Dashboard (0:00 - 0:15)**
   - Rajesh logs in and sees his "Academic Pulse" (3 items need attention: Chemistry CT tomorrow, weak VSEPR topic, and pending assignments).
   - The dashboard tells him his "Next Best Action": *"Review Molecular Orbital Theory, then practice 3 recurring questions."*

2. **Exam Intelligence (0:15 - 0:55)**
   - Rajesh navigates to **Exam Intelligence**, selects *Chemistry (Chem 1101)*, and clicks **Analyze Exam Patterns**.
   - An elegant multi-stage analysis progress bar appears (extracting concepts, identifying recurrences, analyzing teacher tendencies).
   - The results show a **Topic Recurrence / High-Yield Pattern Map** (the signature horizontal highlighter bar visualization).
   - *Molecular Orbital Theory* is ranked #1 (appeared in 4 of 5 past assessments). He sees the exact evidence and the teacher style analysis: *"Application-oriented (60% application, 20% conceptual, 20% numerical) with high lecture dependency."*

3. **OCR Question Paper Analysis (0:55 - 1:20)**
   - Rajesh clicks on the **OCR Question Paper Analysis** tab.
   - He uploads an image or PDF of a past Physics paper.
   - Gemini does OCR, extracts the questions, lists identified topics, and suggests **3 practice questions** based on the paper. Rajesh can click "Start Practice Session" on any question to load it instantly.

4. **Course Copilot (1:20 - 1:45)**
   - Rajesh opens the **Course Copilot**, asks *"What is hydrogen bonding?"* and receives a response grounded strictly in Chemistry slides with highlighted source citations: `[Source: Lecture 06 - Chemical Bonding]`.
   - The chat interface is centered with a modern `860px` maximum width.

5. **RUET CSE Archive Integration (1:45 - 2:10)**
   - Rajesh opens the **Resource Hub** and navigates to the **RUET CSE Archive Google Drive** tab.
   - He browses folders (1-1, 1-2, 2-1, Bookshelf). He clicks **Import All Folder Files** to pull academic resources directly into his local AI knowledge base.

---

## 🛠️ Tech Stack

- **Frontend:** React (TypeScript), Vite, React Router, Lucide Icons.
- **Styling:** Premium Custom Vanilla CSS (light, minimal academic aesthetic; Space Grotesk + Inter typography).
- **Backend:** Express.js (Node.js) serving static production assets and proxying API routes.
- **AI Integrations:** Official `@google/genai` SDK, using `gemini-3.6-flash` for multi-stage structured JSON analysis, chat grounding, practice evaluation, and multimodal OCR analysis.
- **State & Data:** localStorage for offline capability + demo seed data.

---

## 🚀 Quick Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm

### 1. Clone & Install Dependencies
```bash
# Install NPM packages
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
```

### 3. Run Locally (Concurrent Dev Mode)
```bash
npm run dev
```
Open **http://localhost:5173** in your browser.

### 4. Build & Run in Production
```bash
npm run build
npm run start
```
Open **http://localhost:3001** in your browser.

---

## 📝 Devpost Submission Info

### 💡 Problem
RUET students have access to abundant files (past papers, senior notes, slides, books) but waste hours manually trying to spot patterns and guess what is important before an exam. Different teachers use entirely different question-setting styles, making it hard to prioritize.

### 💡 Solution
**Arohon** automates academic resource analysis. It extracts concepts from past questions and matches them with current lecture progress to prioritize what to study, analyzes the teacher's question style, generates likely question archetypes with evidence, offers smart practice with interactive grading, and recommends the student's next action.

### 💡 Gemini Usage & Value
- **Multi-Stage JSON Extraction:** Gemini parses scattered text from historical papers and structures it into topic hierarchies, recurrence rates, and teacher styles.
- **Grounded Retrieval (RAG):** Course Copilot context is dynamically injected to ensure Gemini only answers using actual course slides, listing specific citations.
- **Multimodal OCR Ingestion:** Gemini accepts scanned question paper uploads, extracts layout text, maps them to topics, and generates custom revision practice sheets.
- **Interactive Evaluation:** Instead of dumping solutions, Gemini scores student answers, identifies missing concepts, and guides learning.

---

## 🔒 Security
- No API keys are exposed to the client.
- The React frontend proxies all requests through the Express backend, keeping the `GEMINI_API_KEY` safe as a server-side secret.
