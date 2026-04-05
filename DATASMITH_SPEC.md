# Datasmith — Project Specification

> A precision synthetic dataset forge. Describe a machine learning task in plain English and get a fully labeled, configurable, downloadable dataset in seconds.

---

## 1. Project Overview

**Name:** Datasmith  
**Tagline:** Forge datasets from nothing.  
**Type:** Web application (single-page, multi-step flow)  
**Primary User:** ML engineers, data scientists, AI researchers, students  
**Core Value:** Eliminate the hours spent bootstrapping labeled training data for new ML tasks by generating realistic, configurable synthetic datasets using Gemini 2.0 Flash.

---

## 2. Brand & Design System

### 2.1 Color Tokens

```css
:root {
  /* Backgrounds */
  --color-bg-base:        #0E0E10;  /* Obsidian — page background */
  --color-bg-surface:     #1A1A1E;  /* Charcoal — cards, panels */
  --color-bg-elevated:    #242428;  /* Iron — modals, dropdowns, hover states */

  /* Borders */
  --color-border-default: #2E2E34;  /* Ash */
  --color-border-focus:   #E8642A;  /* Forge Orange on focus */

  /* Brand */
  --color-accent:         #E8642A;  /* Forge Orange — primary CTA, highlights */
  --color-accent-hover:   #C94A1A;  /* Deeper orange on hover */
  --color-accent-gradient: linear-gradient(135deg, #E8642A 0%, #C94A1A 100%);

  /* Text */
  --color-text-primary:   #F0EEE8;  /* Bone White */
  --color-text-secondary: #8A8A94;  /* Smoke */
  --color-text-disabled:  #4A4A52;

  /* Semantic */
  --color-success:        #3DD68C;  /* Ember Green */
  --color-danger:         #E8442A;  /* Slag Red */
  --color-warning:        #F0A832;

  /* Component */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-pill: 999px;
}
```

### 2.2 Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Logo / Wordmark | Geist Mono | 700 | 24px |
| Page headings | Geist Sans | 500 | 22–28px |
| Section headings | Geist Sans | 500 | 16–18px |
| Body text | Geist Sans | 400 | 14–15px |
| Schema / code | Geist Mono | 400 | 13px |
| Labels (uppercase) | Geist Sans | 500 | 11px, letter-spacing: 0.08em |
| Buttons | Geist Sans | 500 | 14px |

**Font source:** `https://vercel.com/font` (open source, self-hostable)  
**Fallback:** `'Geist Sans', system-ui, -apple-system, sans-serif`

### 2.3 Component Styles

**Buttons**
- Primary: `background: var(--color-accent-gradient)`, white text, `border-radius: var(--radius-md)`, padding `10px 20px`, hover darkens to `--color-accent-hover`
- Secondary: transparent background, `border: 1px solid var(--color-border-default)`, text `--color-text-secondary`, hover `background: var(--color-bg-elevated)`
- Disabled: `opacity: 0.35`, `cursor: not-allowed`

**Inputs / Textareas**
- Background: `var(--color-bg-elevated)`
- Border: `1px solid var(--color-border-default)`
- Focus border: `1px solid var(--color-accent)`
- Focus ring: `box-shadow: 0 0 0 3px rgba(232,100,42,0.15)`
- Border radius: `var(--radius-md)`
- Text: `var(--color-text-primary)`, placeholder `var(--color-text-disabled)`

**Cards / Panels**
- Background: `var(--color-bg-surface)`
- Border: `1px solid var(--color-border-default)`
- Border radius: `var(--radius-lg)`
- Padding: `20px 24px`

**Badges / Tags**
- Success: `background: rgba(61,214,140,0.1)`, `color: #3DD68C`, `border: 1px solid rgba(61,214,140,0.2)`
- Warning: `background: rgba(240,168,50,0.1)`, `color: #F0A832`
- Danger: `background: rgba(232,68,42,0.1)`, `color: #E8442A`
- Neutral: `background: var(--color-bg-elevated)`, `color: var(--color-text-secondary)`

**Sliders**
- Track: `background: var(--color-border-default)`, height `4px`
- Fill: `var(--color-accent)`
- Thumb: `background: white`, `border: 2px solid var(--color-accent)`, size `18px`

---

## 3. Application Flow

```
Screen 1          Screen 2          Screen 3          Screen 4
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  FORGE   │ ───▶ │  SCHEMA  │ ───▶ │ CASTING  │ ───▶ │  OUTPUT  │
│          │      │          │      │          │      │          │
│ Describe │      │ Review & │      │ Progress │      │ Preview  │
│ your     │      │ edit     │      │ + live   │      │ export   │
│ task     │      │ features │      │ counter  │      │ download │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
```

**Navigation rule:** User moves forward step by step. Back navigation allowed on screens 1 and 2. Screen 3 (Casting) locks navigation — committing to generation. Screen 4 allows "Forge Another" which resets to Screen 1.

**Persistent elements across all screens:**
- Top navbar: Datasmith logo (left), current step indicator (center), GitHub link (right)
- Step indicator: 4 dots with labels — active dot is Forge Orange, completed dots are filled Ember Green, upcoming dots are Ash

---

## 4. Screen-by-Screen Specification

---

### Screen 1 — Forge

**Purpose:** Collect task description and generation settings.

**Layout:** Single centered column, max-width 680px, vertically centered on page.

**Elements:**

#### Task Description Input
- Large textarea, min-height 120px
- Placeholder: *"e.g. Binary classification to detect fraudulent bank transactions based on amount, merchant category, location, and time of day"*
- Label above: `DESCRIBE YOUR TASK` (uppercase, secondary color)
- Character counter below (bottom right): `0 / 500`
- Validation: minimum 20 characters before allowing next step

#### Task Type Selector
- Label: `TASK TYPE`
- Segmented control (not a dropdown) with 5 options:
  - Classification
  - Text / NLP
  - Regression
  - Named Entity Recognition (NER)
  - Question & Answer
- Selected option: Forge Orange background, white text
- Unselected: transparent, secondary text

#### Row Count Slider
- Label: `ROWS TO GENERATE`
- Range: 50 – 2000, step 50
- Live value display next to label: e.g. `500 rows`
- Default: 200

#### Output Format Toggle
- Label: `OUTPUT FORMAT`
- Three toggle buttons: `CSV` | `JSON` | `JSONL`
- Only one selectable at a time
- Default: CSV

#### CTA Button
- Full width, primary style
- Label: `Smelt Schema →`
- Disabled until task description passes minimum length validation
- On click: fires Schema Suggestion API call (show inline spinner on button), then advances to Screen 2

---

### Screen 2 — Schema

**Purpose:** Review and edit Gemini-suggested features and label configuration.

**Layout:** Two-column layout on desktop (split 55% / 45%). Single column on mobile. Max-width 1000px.

#### Left Column — Features

**Header:** `FEATURES` label + `+ Add Feature` button (secondary style, right-aligned)

**Feature Cards** (one card per suggested feature):
Each card contains:
- Feature name (editable inline text input)
- Data type selector: `string` | `integer` | `float` | `boolean` | `category`
- Description hint (small, secondary color, editable) — Gemini generates this, user can edit
- Delete icon (top right of card, shows on hover)
- Drag handle (left edge) — cards are reorderable via drag-and-drop

Gemini generates 5–8 features by default based on task description.

**Add Feature manually:**
- Clicking `+ Add Feature` appends a blank feature card at the bottom
- User fills name, type, and optional hint

#### Right Column — Labels & Controls

**Section 1 — Class Labels** (shown for Classification and NER tasks only)

- Header: `CLASS LABELS`
- List of editable label pills (Gemini suggests 2–5 by default)
- Each pill: label name (editable), delete X button
- `+ Add Label` text button below list
- For NER: entity types instead of class labels (e.g. PERSON, ORG, DATE)

**Section 2 — Class Distribution**

- Header: `DISTRIBUTION`
- Three radio options:
  - `Balanced` — equal rows per class
  - `Imbalanced` — custom % per class (expands to show a percentage input per label, must sum to 100%)
  - `Random` — Gemini decides distribution
- Default: Balanced

**Section 3 — Noise Controls**

- Header: `NOISE & DIFFICULTY`
- **Label Noise** slider: 0–30%, default 0%
  - Tooltip: "Randomly flips this % of labels to simulate real-world mislabeling"
- **Missing Values** slider: 0–20%, default 0%
  - Tooltip: "Injects null values into random cells"
- **Outlier Injection** toggle (on/off): default off
  - Tooltip: "Adds statistically extreme values to numeric columns"
- **Edge Case Boost** toggle (on/off): default off
  - Tooltip: "Instructs Gemini to generate ambiguous boundary examples"

**Bottom of Screen:**
- Back button (secondary, left)
- `Cast Dataset →` CTA (primary, right)

---

### Screen 3 — Casting

**Purpose:** Visual feedback during generation. Makes the process feel intentional and premium, not like a loading spinner.

**Layout:** Full-screen centered, dark background. No sidebars.

**Elements:**

#### Forge Animation
- CSS-only animated element: three horizontal bars that pulse in sequence (like heat waves or a loading forge)
- Color: Forge Orange with opacity animation (`opacity: 0.3` → `opacity: 1` → `opacity: 0.3`)
- No external animation libraries

#### Status Text
- Large center text (20px, Geist Mono): `Casting batch 3 of 8...`
- Updates live as each batch completes

#### Row Counter
- Below status text: `847 rows cast` (ticks up in real-time as batches return)
- Font: Geist Mono, 32px, Bone White

#### Progress Bar
- Full width (max 480px), below counter
- Height: 4px, border-radius pill
- Fill: Forge Orange gradient
- Animates smoothly between batch completions

#### Batch Size Logic (developer note)
- Each Gemini API call generates 50 rows max (to stay within token limits)
- Total batches = `Math.ceil(targetRows / 50)`
- Calls are made sequentially (not parallel) to avoid rate limits
- Each response is appended to a master array

**No back button on this screen.** Generation is committed.

---

### Screen 4 — Output

**Purpose:** Preview the generated data, review quality stats, and export.

**Layout:** Full width, max 1100px. Stacked sections.

#### Section 1 — Stats Row
Four metric cards in a horizontal row:
- **Rows Generated** — total row count (success badge color)
- **Features** — number of columns
- **Class Balance** — "Balanced" or "Skewed X%" (warning badge if imbalanced)
- **Null Cells** — count and % of null values injected

#### Section 2 — Data Preview Table
- Shows first 20 rows
- Horizontal scroll on overflow
- Column headers: feature names, bold, Geist Mono
- Data cells: Geist Mono, 13px
- Null values render as `—` in secondary color
- Alternating row background: `var(--color-bg-surface)` / `var(--color-bg-elevated)`
- "Showing 20 of N rows" label below table

#### Section 3 — Export

**Download Dataset**
- Three buttons side by side: `Download CSV` | `Download JSON` | `Download JSONL`
- All primary style but smaller padding
- Each triggers client-side file download (no server needed)
- File naming: `datasmith-[task-slug]-[timestamp].[ext]`

**Download Dataset Card**
- Separate secondary button: `Download Dataset Card (.md)`
- Downloads a markdown file with: task description, feature list with types, class labels, distribution, noise settings, row count, generation date, and suggested citation format

#### Section 4 — Actions
- `Forge Another Dataset →` — resets entire state, returns to Screen 1
- `Copy JSON to Clipboard` — copies full dataset as JSON string

---

## 5. Gemini API Integration

### 5.1 Model
```
Model: gemini-2.0-flash
response_mime_type: "application/json"
max_tokens: 8192 (per call)
```

### 5.2 Call 1 — Schema Suggestion

**Trigger:** User clicks "Smelt Schema →" on Screen 1

**Prompt:**
```
You are a machine learning data engineer. A user wants to generate a synthetic dataset for the following ML task:

Task: "{taskDescription}"
Task Type: "{taskType}"

Return a JSON object with exactly this structure:
{
  "features": [
    {
      "name": "feature_name",
      "type": "string | integer | float | boolean | category",
      "hint": "brief description of what realistic values look like"
    }
  ],
  "labels": ["label1", "label2"],
  "suggested_distribution": "balanced | imbalanced",
  "notes": "one sentence of advice for this dataset type"
}

Rules:
- Suggest 5 to 8 features that are realistic and relevant to the task
- Feature names must be lowercase with underscores (snake_case)
- Suggest 2 to 5 class labels appropriate for the task type
- Return only valid JSON. No explanation, no markdown fences.
```

**Response handling:** Parse JSON directly. Populate Screen 2 feature cards and label pills.

---

### 5.3 Call 2 — Batch Row Generation

**Trigger:** User clicks "Cast Dataset →" on Screen 2. Repeat until target row count is reached.

**Prompt:**
```
You are a synthetic data generator. Generate exactly {batchSize} rows of realistic synthetic data for this ML task.

Task: "{taskDescription}"
Task Type: "{taskType}"

Schema:
{JSON.stringify(features)}

Labels: {labels.join(", ")}
Distribution: {distributionConfig}
Edge Cases: {edgeCaseBoost ? "Include 15% ambiguous boundary examples" : "Standard examples only"}

Return a JSON array of {batchSize} objects. Each object must have exactly these keys: {featureNames.join(", ")}, "label".

Rules:
- Values must be realistic and varied — not repetitive
- Respect the data types strictly (integers must be integers, etc.)
- Follow the distribution: {distributionDescription}
- Return only a valid JSON array. No explanation, no markdown fences.
```

**Batch loop pseudocode:**
```javascript
const batchSize = 50;
const totalBatches = Math.ceil(targetRows / batchSize);
let allRows = [];

for (let i = 0; i < totalBatches; i++) {
  const rowsNeeded = Math.min(batchSize, targetRows - allRows.length);
  const batch = await callGemini(buildBatchPrompt(rowsNeeded));
  allRows = [...allRows, ...JSON.parse(batch)];
  updateProgress(i + 1, totalBatches, allRows.length);
}
```

---

### 5.4 Call 3 — Dataset Card Generation

**Trigger:** User clicks "Download Dataset Card" on Screen 4

**Prompt:**
```
Generate a professional HuggingFace-style dataset card in markdown format for this synthetic dataset.

Dataset name: datasmith-{taskSlug}
Task: "{taskDescription}"
Task Type: "{taskType}"
Features: {JSON.stringify(features)}
Labels: {labels.join(", ")}
Rows: {totalRows}
Noise level: {labelNoise}%
Missing values: {missingValues}%
Generated: {date}

Include these sections: Dataset Summary, Task Description, Features, Label Distribution, Known Limitations, Intended Use, Citation.
Keep it professional and concise. Return only the markdown.
```

---

### 5.5 Client-Side Post-Processing (No API needed)

Apply after all batches are complete, before displaying results:

```javascript
function applyNoise(rows, labelNoise, missingValues, outlierInjection) {
  return rows.map(row => {
    // Label noise: randomly flip label
    if (Math.random() < labelNoise / 100) {
      row.label = getRandomLabel(labels.filter(l => l !== row.label));
    }

    // Missing values: randomly null a non-label field
    Object.keys(row).forEach(key => {
      if (key !== 'label' && Math.random() < missingValues / 100) {
        row[key] = null;
      }
    });

    // Outlier injection: set numeric field to extreme value
    if (outlierInjection) {
      const numericKeys = getNumericKeys(row);
      if (numericKeys.length > 0 && Math.random() < 0.05) {
        const key = numericKeys[Math.floor(Math.random() * numericKeys.length)];
        row[key] = Math.random() > 0.5 ? 999999 : -999999;
      }
    }

    return row;
  });
}
```

---

## 6. File Export Logic

### CSV Export
```javascript
import Papa from 'papaparse';

function downloadCSV(rows, filename) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
}
```

### JSON Export
```javascript
function downloadJSON(rows, filename) {
  const json = JSON.stringify(rows, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  triggerDownload(blob, `${filename}.json`);
}
```

### JSONL Export
```javascript
function downloadJSONL(rows, filename) {
  const jsonl = rows.map(r => JSON.stringify(r)).join('\n');
  const blob = new Blob([jsonl], { type: 'application/x-ndjson' });
  triggerDownload(blob, `${filename}.jsonl`);
}
```

### Shared trigger
```javascript
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Filename convention
```javascript
const taskSlug = taskDescription
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .slice(0, 40);
const timestamp = new Date().toISOString().slice(0, 10);
const filename = `datasmith-${taskSlug}-${timestamp}`;
```

---

## 7. State Management

Use React `useState` + `useReducer` or Zustand for global state. No backend or database needed — everything is client-side.

```typescript
interface DatasmithState {
  // Screen 1
  taskDescription: string;
  taskType: 'classification' | 'nlp' | 'regression' | 'ner' | 'qa';
  targetRows: number;
  outputFormat: 'csv' | 'json' | 'jsonl';

  // Screen 2
  features: Feature[];
  labels: string[];
  distribution: 'balanced' | 'imbalanced' | 'random';
  customDistribution: Record<string, number>;
  labelNoise: number;
  missingValues: number;
  outlierInjection: boolean;
  edgeCaseBoost: boolean;

  // Screen 3
  currentBatch: number;
  totalBatches: number;
  rowsGenerated: number;

  // Screen 4
  generatedRows: Record<string, unknown>[];
  datasetCard: string;
}

interface Feature {
  id: string;
  name: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'category';
  hint: string;
}
```

---

## 8. Project File Structure

```
datasmith/
├── public/
│   └── favicon.svg             # Anvil or hammer icon in Forge Orange
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # Logo + step indicator + GitHub link
│   │   │   └── StepIndicator.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── SegmentedControl.tsx
│   │   ├── forge/
│   │   │   └── TaskForm.tsx    # Screen 1 form
│   │   ├── schema/
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── FeatureList.tsx
│   │   │   ├── LabelEditor.tsx
│   │   │   └── NoiseControls.tsx
│   │   ├── casting/
│   │   │   ├── ForgeAnimation.tsx
│   │   │   └── ProgressDisplay.tsx
│   │   └── output/
│   │       ├── StatsRow.tsx
│   │       ├── DataTable.tsx
│   │       └── ExportPanel.tsx
│   ├── screens/
│   │   ├── ForgeScreen.tsx     # Screen 1
│   │   ├── SchemaScreen.tsx    # Screen 2
│   │   ├── CastingScreen.tsx   # Screen 3
│   │   └── OutputScreen.tsx    # Screen 4
│   ├── lib/
│   │   ├── gemini.ts           # All Gemini API calls + prompts
│   │   ├── export.ts           # CSV / JSON / JSONL download logic
│   │   ├── noise.ts            # Post-processing: noise, nulls, outliers
│   │   └── prompts.ts          # All prompt templates as constants
│   ├── store/
│   │   └── datasmith.ts        # Global state (Zustand or useReducer)
│   ├── styles/
│   │   └── globals.css         # CSS variables + base styles
│   ├── App.tsx                 # Screen router
│   └── main.tsx
├── .env                        # VITE_GEMINI_API_KEY=your_key
├── package.json
└── vite.config.ts
```

---

## 9. Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | React 18 + TypeScript | Type safety, component model |
| Build tool | Vite | Fast dev server, simple config |
| Styling | CSS Modules + CSS Variables | No Tailwind dependency, full control |
| State | Zustand | Lightweight, no boilerplate |
| AI | Gemini 2.0 Flash API | Fast, large context, JSON mode |
| CSV parsing | Papa Parse | Most robust CSV library |
| Drag-and-drop | @dnd-kit/core | For feature card reordering |
| Table | TanStack Table | Headless, fully custom styled |
| Markdown render | marked.js | Dataset card preview |
| Hosting | Vercel (recommended) | Free tier, instant deploy |

---

## 10. Environment Setup

```bash
# Install
npm create vite@latest datasmith -- --template react-ts
cd datasmith
npm install zustand papaparse @tanstack/react-table @dnd-kit/core marked
npm install -D @types/papaparse

# .env file
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Run
npm run dev
```

**API key:** Get from [Google AI Studio](https://aistudio.google.com/app/apikey) — free tier available.

---

## 11. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Gemini returns malformed JSON | Wrap all parse calls in try/catch; show inline error with retry button |
| Batch generation fails mid-way | Save completed batches to state; show "Resume" option |
| User requests 2000 rows | 40 sequential API calls — show estimated time ("~2 min") before confirming |
| Label distribution percentages don't sum to 100% | Inline validation with red border + "Must total 100%" message, CTA disabled |
| Feature name has spaces or special chars | Auto-sanitize to snake_case on blur |
| Gemini returns fewer rows than requested | Detect and run a top-up batch automatically |
| API key missing | Show a dismissible banner on Screen 1 with setup instructions |

---

## 12. LinkedIn Description

> "Built **Datasmith** — a synthetic ML dataset generator powered by Gemini 2.0 Flash. Describe a machine learning task in plain English and get a fully labeled, configurable training dataset with noise injection, class imbalance controls, and an auto-generated HuggingFace dataset card — in under 60 seconds. Built with React, TypeScript, and the Gemini API."

---

## 13. Resume Bullet

> Engineered a synthetic dataset generation tool (Datasmith) using Gemini 2.0 Flash with structured JSON output, multi-batch generation pipelines, and client-side noise injection — reducing dataset bootstrapping time from days to under 60 seconds.

---

*Generated by Datasmith spec — version 1.0*
