# SAHAY-V — Reconstruction Report

## Summary & Verification Status

```
Python syntax       PASS
Imports             PASS
Flask startup       PASS
Database            PASS
Templates           PASS
Static files        PASS
API routes          PASS
n8n integration     BLOCKED (graceful fallback active when webhook is offline)
```

---

## 1. Files Discovered in Workspace

Initially, 23 disconnected files were received from WhatsApp and located at the root of `SAHAY/`:

1. `__init__.py` (25 bytes) — Header indicated `# SAHAY-V Routes Package`
2. `__init__.cpython-313.pyc` (148 bytes)
3. `main (1).py` (246 bytes) — WhatsApp copy of `routes/main.py`
4. `main.cpython-313.pyc` (560 bytes)
5. `chat.py` (5,117 bytes) — Blueprint `chat_bp`
6. `chat.cpython-313.pyc` (5,487 bytes)
7. `journey.py` (4,700 bytes) — Blueprint `journey_bp`
8. `journey.cpython-313.pyc` (6,779 bytes)
9. `safety.py` (231 bytes) — Blueprint `safety_bp`
10. `safety.cpython-313.pyc` (545 bytes)
11. `app.cpython-313.pyc` (3,224 bytes) — Compiled application factory (`app.py` source was missing)
12. `config.cpython-313.pyc` (981 bytes) — Compiled configuration class (`config.py` source was missing)
13. `models.cpython-313.pyc` (3,508 bytes) — Compiled models & scale helpers (`models.py` source was missing)
14. `base.html` (5,020 bytes) — Jinja base template
15. `index (2).html` (5,116 bytes) — WhatsApp duplicate name of `index.html`
16. `chat.html` (5,618 bytes) — Jinja chat template
17. `journey.html` (8,688 bytes) — Jinja journey template
18. `safety.html` (11,925 bytes) — Jinja safety template
19. `style.css` (3,007 bytes) — Custom CSS stylesheet
20. `chat.js` (8,407 bytes) — Chat interface controller
21. `journey.js` (11,222 bytes) — Journey dashboard controller
22. `safety.js` (4,118 bytes) — Safety exercises controller
23. `sahay_v.db` (8,192 bytes) — SQLite database with 7 active journal records

---

## 2. Source Code Reconstruction from Bytecode (.pyc)

Three critical root Python files were missing their corresponding `.py` source text:
1. `config.py`
2. `models.py`
3. `app.py`

### Forensics & Bytecode Extraction
Using Python bytecode marshal analysis and constant inspection of the Python 3.13 code objects, the original structure, class definitions, function signatures, error handling blocks, and lines were extracted with exact fidelity:

- **[config.py](file:///d:/antigracvity%20files/SAHAY/config.py)**:
  - Extracted class `Config`
  - Reconstructed `os.environ.get('SECRET_KEY', 'sahay-v-calming-secret-key-default')`
  - Reconstructed `SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///sahay_v.db')`
  - Reconstructed `SQLALCHEMY_TRACK_MODIFICATIONS = False`
  - Reconstructed `SAHAY_WEBHOOK_URL = os.environ.get('SAHAY_WEBHOOK_URL', 'http://localhost:5678/webhook/sahay-v/assessment')`

- **[models.py](file:///d:/antigracvity%20files/SAHAY/models.py)**:
  - Extracted `get_emoji_and_label(level)` implementing the exact 1–10 scale:
    - 1–2: 😌 Calm
    - 3–4: 🙂 Mild
    - 5–6: 😟 Moderate
    - 7–8: 😰 High
    - 9–10: 🥵 Severe
    - Exception handling default: `level = 5`
  - Extracted `JournalEntry(db.Model)` with table `journal_entries` and columns: `id`, `timestamp`, `anxiety_level`, `emoji`, `short_thought`, `source`.
  - Reconstructed `__init__` with bound clamping `max(1, min(10, int(anxiety_level)))`.
  - Reconstructed `to_dict()` formatting fields: `formatted_time`, `time_only`, `date_only`, `emoji`, `label`.

- **[app.py](file:///d:/antigracvity%20files/SAHAY/app.py)**:
  - Extracted `create_app(config_class=Config)` with `instance_relative_config=True`.
  - Extracted automatic registration of all four blueprints: `main_bp`, `chat_bp`, `journey_bp`, `safety_bp`.
  - Extracted `seed_sample_data_if_empty()` which originally seeded the 5 sample records now in `sahay_v.db`.
  - Extracted `app.run(host='0.0.0.0', port=5000, debug=True)`.

---

## 3. File Relocations & Renaming Log

| Original Location / Name | Reconstructed Target Location | Action Reason |
| :--- | :--- | :--- |
| `__init__.py` | `routes/__init__.py` | Declares the routes Python package (`# SAHAY-V Routes Package`) |
| `main (1).py` | `routes/main.py` | WhatsApp copy of `main_bp` route handler |
| `chat.py` | `routes/chat.py` | Chat companion blueprint (`chat_bp`) |
| `journey.py` | `routes/journey.py` | Journey analytics blueprint (`journey_bp`) |
| `safety.py` | `routes/safety.py` | Crisis & grounding blueprint (`safety_bp`) |
| `index (2).html` | `templates/index.html` | WhatsApp renamed download of `index.html` |
| `base.html` | `templates/base.html` | Base Jinja layout referenced by all templates |
| `chat.html` | `templates/chat.html` | Rendered by `chat.py` |
| `journey.html` | `templates/journey.html` | Rendered by `journey.py` |
| `safety.html` | `templates/safety.html` | Rendered by `safety.py` |
| `style.css` | `static/css/style.css` | Referenced as `url_for('static', filename='css/style.css')` |
| `chat.js` | `static/js/chat.js` | Referenced as `url_for('static', filename='js/chat.js')` |
| `journey.js` | `static/js/journey.js` | Referenced as `url_for('static', filename='js/journey.js')` |
| `safety.js` | `static/js/safety.js` | Referenced as `url_for('static', filename='js/safety.js')` |
| `sahay_v.db` | `instance/sahay_v.db` | Flask SQLite instance-relative database path |
| *Missing asset* | `static/images/logo.svg` | Created brand emblem referenced in `base.html` & `index.html` |
| All `*.cpython-313.pyc` | `archive/` | Preserved for reference and forensic auditing |
| Original files | `archive/*.bak` | Safe backup copies kept prior to any movement |

---

## 4. Database Integrity Verification

The existing database file `sahay_v.db` was preserved without data loss or reset:
- **Engine**: SQLite 3
- **Table**: `journal_entries`
- **Schema**:
  ```sql
  CREATE TABLE journal_entries (
      id INTEGER NOT NULL PRIMARY KEY, 
      timestamp DATETIME NOT NULL, 
      anxiety_level INTEGER NOT NULL, 
      emoji VARCHAR(10) NOT NULL, 
      short_thought VARCHAR(200), 
      source VARCHAR(20) NOT NULL
  );
  ```
- **Records Verified**:
  - `ID 1`: 2026-09-21 | Level 3 🙂 | manual | "Morning coffee reflection. Feeling peaceful."
  - `ID 2`: 2026-09-23 | Level 6 😟 | manual | "Work deadline pressure building up."
  - `ID 3`: 2026-09-24 | Level 5 😟 | chat | "AI Chat Assessment: Discussed evening anxiety..."
  - `ID 4`: 2026-09-25 | Level 4 🙂 | manual | "Took a 15-min walk outside. Feeling lighter."
  - `ID 5`: 2026-09-26 | Level 2 😌 | manual | "Practiced 5-4-3-2-1 grounding exercise. Very calm."
  - `ID 6`: 2026-09-26 | Level 2 😌 | manual | "Took a peaceful evening walk"
  - `ID 7`: 2026-09-26 | Level 2 😌 | manual | "Took a peaceful evening walk"

---

## 5. Blueprint & Route Registration

```
/                         ['GET', 'HEAD', 'OPTIONS']  -> main.index
/api/chat                 ['POST', 'OPTIONS']         -> chat.api_chat
/api/journey/data         ['GET', 'HEAD', 'OPTIONS']  -> journey.get_journey_data
/api/journey/entry        ['POST', 'OPTIONS']         -> journey.add_journey_entry
/chat                     ['GET', 'HEAD', 'OPTIONS']  -> chat.chat_page
/journey                  ['GET', 'HEAD', 'OPTIONS']  -> journey.journey_page
/safety                   ['GET', 'HEAD', 'OPTIONS']  -> safety.safety_page
/static/<path:filename>   ['GET', 'HEAD', 'OPTIONS']  -> static
```

---

## 6. n8n AI Assessment Integration Status

- **Status**: `BLOCKED` (n8n webhook is not running locally on port 5678).
- **Behavior**: The application gracefully catches timeouts and connection failures without crashing or throwing HTTP 500 errors, returning a warm, supportive response:
  > *"I'm here with you 🤍. My connection to the assessment service is currently resting, but your feelings matter deeply. Take a gentle breath and explore your Journey or Safety tools."*
- To activate n8n, run the n8n workflow or set `SAHAY_WEBHOOK_URL` in `.env`.
