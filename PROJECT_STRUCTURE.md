# SAHAY-V — Project Architecture & File Map

```
SAHAY/
│
├── app.py                      # Flask Application Factory & Server Entry Point
├── config.py                   # Central Application Configuration (Secrets, DB, Webhooks)
├── models.py                   # SQLAlchemy Database Models (JournalEntry) & Mood Scales
├── requirements.txt            # Python Dependencies
├── .env.example                # Environment Variable Template (No secrets)
├── README.md                   # Setup, Execution, & Project Overview
├── PROJECT_STRUCTURE.md        # Detailed Architectural & File Mapping (This document)
├── API_DOCUMENTATION.md        # Complete REST & Webhook API Contract
├── RECONSTRUCTION_REPORT.md    # Full Forensic Reconstruction Log & Test Verifications
│
├── routes/                     # Modular Flask Blueprints
│   ├── __init__.py             # Routes Package Initialization
│   ├── main.py                 # Blueprint 'main': Landing Page Route (/)
│   ├── chat.py                 # Blueprint 'chat': AI Companion (/chat, /api/chat -> n8n)
│   ├── journey.py              # Blueprint 'journey': Reflection Dashboard & APIs (/journey, /api/journey/*)
│   └── safety.py               # Blueprint 'safety': Crisis Resources & Grounding Exercises (/safety)
│
├── templates/                  # Jinja2 HTML Templates
│   ├── base.html               # Master Layout: Navigation, Aesthetics, Tailwind & Fonts
│   ├── index.html              # Landing Page with Hero & Quick Feature Cards
│   ├── chat.html               # Chat Interface with Real-time Stream & Mood Slider
│   ├── journey.html            # Mood Analytics Dashboard, Chart.js Visualizer & Timeline
│   └── safety.html             # SOS Helplines, 4-4-4 Breathing Circle & 5-4-3-2-1 Sensory Grounding
│
├── static/                     # Static Client Assets
│   ├── css/
│   │   └── style.css           # Custom Glassmorphic Styles, HSL Color Tokens, & Animation Keyframes
│   ├── js/
│   │   ├── chat.js             # Chat Controller: Session Management & /api/chat Proxying
│   │   ├── journey.js          # Journey Controller: Chart.js Line Graphs, Filters, & Modals
│   │   └── safety.js           # Safety Controller: Interactive Breathing Timer & 5-4-3-2-1 Checkbox Logic
│   └── images/
│       └── logo.svg            # Calming SAHAY-V Vector Brand Emblem
│
├── instance/                   # Instance Folder for SQLite Database
│   └── sahay_v.db              # SQLite Database Containing `journal_entries` (Preserved intact)
│
└── archive/                    # Preserved .pyc artifacts & WhatsApp duplicate backups
    ├── sahay_v.db.bak
    ├── __init__.py.bak
    ├── main (1).py.bak
    ├── chat.py.bak
    ├── journey.py.bak
    ├── safety.py.bak
    ├── base.html.bak
    ├── index (2).html.bak
    ├── chat.html.bak
    ├── journey.html.bak
    ├── safety.html.bak
    ├── style.css.bak
    ├── chat.js.bak
    ├── journey.js.bak
    ├── safety.js.bak
    ├── test_reconstruction.py
    └── *.cpython-313.pyc
```

---

## Detailed Component Responsibilities

### Core Backend
- **[app.py](file:///d:/antigracvity%20files/SAHAY/app.py)**: Initializes the Flask application with `instance_relative_config=True`, attaches `Config`, initializes SQLAlchemy, registers all 4 Blueprints (`main_bp`, `chat_bp`, `journey_bp`, `safety_bp`), creates database tables if missing, and provides default seed data if the database is newly initialized. Runs development server on `0.0.0.0:5000`.
- **[config.py](file:///d:/antigracvity%20files/SAHAY/config.py)**: Loads environment variables using `python-dotenv`. Configures `SECRET_KEY`, `SQLALCHEMY_DATABASE_URI` (`sqlite:///sahay_v.db`), `SQLALCHEMY_TRACK_MODIFICATIONS` (`False`), and `SAHAY_WEBHOOK_URL` (`http://localhost:5678/webhook/sahay-v/assessment`).
- **[models.py](file:///d:/antigracvity%20files/SAHAY/models.py)**: Defines `JournalEntry` model mapped to table `journal_entries` with fields: `id`, `timestamp`, `anxiety_level`, `emoji`, `short_thought`, `source`. Also provides the centralized helper `get_emoji_and_label(level)` defining the 1–10 anxiety scale:
  - 1–2: 😌 Calm
  - 3–4: 🙂 Mild
  - 5–6: 😟 Moderate
  - 7–8: 😰 High
  - 9–10: 🥵 Severe

### Routes (Flask Blueprints)
- **[routes/main.py](file:///d:/antigracvity%20files/SAHAY/routes/main.py)** (`main_bp`):
  - `GET /`: Renders `index.html`.
- **[routes/chat.py](file:///d:/antigracvity%20files/SAHAY/routes/chat.py)** (`chat_bp`):
  - `GET /chat`: Renders `chat.html`.
  - `POST /api/chat`: Proxies messages to the external n8n AI webhook, parses anxiety scores from assessment results, auto-logs to `JournalEntry`, and provides graceful fallback responses if n8n is offline.
- **[routes/journey.py](file:///d:/antigracvity%20files/SAHAY/routes/journey.py)** (`journey_bp`):
  - `GET /journey`: Renders `journey.html`.
  - `GET /api/journey/data`: Aggregates Today, Week, and Month anxiety averages and produces time-series chart data (`labels`, `values`, `emojis`) and timeline entries.
  - `POST /api/journey/entry`: Saves manual or chat-prompted mood log entries into the SQLite database.
- **[routes/safety.py](file:///d:/antigracvity%20files/SAHAY/routes/safety.py)** (`safety_bp`):
  - `GET /safety`: Renders `safety.html`.

### Templates (Jinja2)
- **[templates/base.html](file:///d:/antigracvity%20files/SAHAY/templates/base.html)**: Master frame featuring sticky glassmorphism header, responsive navigation, emergency crisis banner, disclaimers, Tailwind CSS, Google Fonts (Outfit & Inter), and Chart.js integration.
- **[templates/index.html](file:///d:/antigracvity%20files/SAHAY/templates/index.html)**: Welcome screen with animated ambient glows, brand emblem, and 3 primary feature cards.
- **[templates/chat.html](file:///d:/antigracvity%20files/SAHAY/templates/chat.html)**: Chat bubble feed, live session typing animation, suggested conversation starter chips, and post-chat mood rating slider.
- **[templates/journey.html](file:///d:/antigracvity%20files/SAHAY/templates/journey.html)**: Today/Week/Month average cards, interactive Chart.js line graph with Day/Week/Month toggles, chronological reverse timeline, and "+ Add Entry" modal.
- **[templates/safety.html](file:///d:/antigracvity%20files/SAHAY/templates/safety.html)**: National helpline cards (Tele-MANAS, KIRAN, Vandrevala), interactive 4-4-4 Box Breathing visualizer, and 5-4-3-2-1 Grounding exercise checklists.

### Client-Side Static Assets
- **[static/css/style.css](file:///d:/antigracvity%20files/SAHAY/static/css/style.css)**: CSS custom properties (`--primary-purple`, `--primary-pink`, `--bg-lavender`), glassmorphism card definitions, float/glow animations, custom scrollbar styling.
- **[static/js/chat.js](file:///d:/antigracvity%20files/SAHAY/static/js/chat.js)**: Manages `localStorage` persistent session IDs, renders chat bubbles, submits messages to `/api/chat`, and logs post-conversation ratings.
- **[static/js/journey.js](file:///d:/antigracvity%20files/SAHAY/static/js/journey.js)**: Controls Chart.js instance, requests `/api/journey/data?range=...`, dynamically updates summary metric cards, and submits new entries to `/api/journey/entry`.
- **[static/js/safety.js](file:///d:/antigracvity%20files/SAHAY/static/js/safety.js)**: Runs the 4-4-4 second breathing animation cycle (Inhale, Hold, Exhale) and handles the 5-4-3-2-1 grounding progress bar.
