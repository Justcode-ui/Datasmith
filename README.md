# Datasmith ⚒

> Forge synthetic ML datasets from plain English — in under 60 seconds.

**[Live Demo →](https://datasmith-tan.vercel.app/)**

Datasmith turns a plain English description of any ML task into a 
complete, jurisdiction-aware, export-ready training dataset using 
Gemini 2.0 Flash or llma 3.3 or deepseekv3.

## Features
- Describe any ML task in plain English
- AI suggests features, labels, and schema automatically
- Location-aware — grounds data in real local laws and thresholds
- Supports any country (Nigeria ₦, UK £, USA $, Kenya KSh...)
- Export as CSV, JSON, or JSONL
- Auto-generated HuggingFace dataset card
- Configurable noise, class imbalance, and edge cases

## Built With
- React + TypeScript + Vite
- Gemini 2.0 Flash API
- Groq (DeepSeek R1 for regional grounding)
- Zustand, TanStack Table, Papa Parse

## Getting Started
\```bash
git clone https://github.com/yourusername/datasmith
cd datasmith
npm install
cp .env.example .env  # add your Gemini API key
npm run dev
\```

