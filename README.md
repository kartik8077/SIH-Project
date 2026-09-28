# SAHAY-V — AI-Powered Mental Health & Emotional Companion

> **Smart India Hackathon Project — "You Are Not Alone" 🤍**

SAHAY-V is an AI-powered emotional support and mental wellness companion designed to help individuals navigate stress, anxiety, and emotional overwhelm.

The platform combines a Flask-based web application with a locally hosted **n8n AI workflow** to provide conversational support, emotional assessment, mood tracking, journaling, and interactive grounding exercises.

> **Important:** SAHAY-V is designed as a supportive companion and is not a replacement for professional medical or mental-health care.

---

## 🌟 Key Features

### 🤖 1. AI Chat Companion

**Route:** `/chat`

- Conversational AI support through an n8n workflow.
- Processes user messages through the AI Assessment Agent.
- Estimates vulnerability/anxiety indicators on a **1–10 scale**.
- Stores assessment information in the user's journey.
- Provides fallback responses when the AI service is unavailable.
- Designed to maintain a calm and supportive conversation experience.

---

### 📊 2. My Journey Dashboard

**Route:** `/journey`

The Journey dashboard helps users understand their emotional patterns over time.

Features include:

- Daily, weekly, and monthly mood summaries.
- Interactive **Chart.js** time-series visualization.
- Day / Week / Month filtering.
- Chronological mood timeline.
- Reflection notes.
- Mood source tracking.
- Anxiety tracking on a **1–10 scale**.
- Animated emoji feedback for the anxiety slider.

---

### 🛡️ 3. Safety & Crisis Resources

**Route:** `/safety`

The safety section provides quick access to supportive resources and grounding exercises.

Features include:

- Mental-health helpline information.
- Tele-MANAS resources.
- KIRAN resources.
- Vandrevala Foundation resources.
- Interactive **4-4-4 Box Breathing** exercise.
- Interactive **5-4-3-2-1 Sensory Grounding** exercise.
- Step-by-step visual guidance during grounding exercises.

---

## 🧠 AI & n8n Integration

SAHAY-V uses **n8n** as the AI workflow orchestration layer.

The Flask backend communicates with a locally hosted n8n webhook:

```text
Flask Application
       │
       ▼
n8n Webhook
       │
       ▼
AI Assessment Workflow
       │
       ▼
AI Processing
       │
       ▼
Assessment + Response
       │
       ▼
Flask Application
