# SAHAY-V — AI-Powered Mental Health & Emotional Companion

> Smart India Hackathon Project: "You Are Not Alone" 🤍

SAHAY-V is a calming, confidential mental health companion designed to assist individuals navigating stress, anxiety, and emotional overwhelm. It provides an AI assessment conversation companion (powered by an n8n workflow), automated and manual mood journal tracking with visual time-series analytics, and interactive grounding exercises.

---

## Key Features

1. **AI Chat Companion (`/chat`)**:
   - Confidential conversation partner connected to an n8n AI Assessment Agent.
   - Automatically assesses vulnerability/anxiety levels (1–10) and logs to the Journey record.
   - Gracefully handles offline AI services with calming, supportive fallbacks.

2. **My Journey Dashboard (`/journey`)**:
   - Tracks mood trends with aggregated summary averages (Today, Week, Month).
   - Interactive Chart.js time-series graph with range filtering (`Day`, `Week`, `Month`).
   - Chronological mood timeline with custom reflection notes and source tracking.
   - Live 1–10 anxiety slider with animated emoji reactions.

3. **Safety & Crisis Resources (`/safety`)**:
   - One-tap access to national mental health helplines (Tele-MANAS, KIRAN, Vandrevala Foundation).
   - Interactive 4-4-4 Box Breathing visualizer with real-time breathing circle animation.
   - Interactive 5-4-3-2-1 Sensory Grounding exercise with progress tracking.

---

## Quick Start Guide

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.13 and 3.14)
- Pip

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration values:
- `SECRET_KEY`: `sahay-v-calming-secret-key-default`
- `SQLALCHEMY_DATABASE_URI`: `sqlite:///sahay_v.db`
- `SAHAY_WEBHOOK_URL`: `http://localhost:5678/webhook/sahay-v/assessment`

### 4. Run the Application
```bash
python app.py
```
Open your browser and navigate to:
```
http://localhost:5000
```

---

## Architecture & Documentation

- [PROJECT_STRUCTURE.md](file:///d:/antigracvity%20files/SAHAY/PROJECT_STRUCTURE.md): Detailed map of files and components.
- [API_DOCUMENTATION.md](file:///d:/antigracvity%20files/SAHAY/API_DOCUMENTATION.md): Complete REST endpoint specifications and request/response payloads.
- [RECONSTRUCTION_REPORT.md](file:///d:/antigracvity%20files/SAHAY/RECONSTRUCTION_REPORT.md): Forensics report documenting file recovery from compiled bytecode and WhatsApp sources.
