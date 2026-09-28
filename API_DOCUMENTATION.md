# SAHAY-V — API Documentation

This document describes all API endpoints implemented across the SAHAY-V backend.

---

## 1. Landing & Navigation Routes

### `GET /`
- **Blueprint**: `main` ([routes/main.py](file:///d:/antigracvity%20files/SAHAY/routes/main.py))
- **Purpose**: Renders the application landing page.
- **Request Parameters**: None
- **Response**: HTML (`templates/index.html`)
- **Dependencies**: Jinja2, `base.html`

### `GET /chat`
- **Blueprint**: `chat` ([routes/chat.py](file:///d:/antigracvity%20files/SAHAY/routes/chat.py))
- **Purpose**: Renders the AI companion chat interface.
- **Request Parameters**: None
- **Response**: HTML (`templates/chat.html`)
- **Dependencies**: Jinja2, `chat.js`

### `GET /journey`
- **Blueprint**: `journey` ([routes/journey.py](file:///d:/antigracvity%20files/SAHAY/routes/journey.py))
- **Purpose**: Renders the "My Journey" emotional reflection & analytics dashboard.
- **Request Parameters**: None
- **Response**: HTML (`templates/journey.html`)
- **Dependencies**: Jinja2, `journey.js`, Chart.js

### `GET /safety`
- **Blueprint**: `safety` ([routes/safety.py](file:///d:/antigracvity%20files/SAHAY/routes/safety.py))
- **Purpose**: Renders the crisis helplines and sensory grounding tools.
- **Request Parameters**: None
- **Response**: HTML (`templates/safety.html`)
- **Dependencies**: Jinja2, `safety.js`

---

## 2. Chat & AI Assessment APIs

### `POST /api/chat`
- **Blueprint**: `chat` ([routes/chat.py](file:///d:/antigracvity%20files/SAHAY/routes/chat.py))
- **Purpose**: Forwards user thoughts to the external n8n AI Assessment Agent webhook (`SAHAY_WEBHOOK_URL`). If the agent returns an anxiety/vulnerability score (1–10), it automatically logs a `chat` entry into the SQLite journal database. If the n8n webhook is unreachable or times out, it gracefully provides a calming fallback message without failing.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "message": "I have been feeling stressed about my examinations lately.",
    "session_id": "session_abc123xyz"
  }
  ```
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "status": "success",
      "reply": "I hear how much pressure you are under. Let's take a deep breath together...",
      "session_id": "session_abc123xyz",
      "anxiety_score": 6,
      "emoji": "😟",
      "label": "Moderate",
      "auto_logged": true
    }
    ```
  - **Client Error (400 Bad Request)**:
    ```json
    {
      "status": "error",
      "reply": "Please write a message so I can listen and help. 🤍"
    }
    ```
- **Dependencies**:
  - `requests`
  - `models.db`, `models.JournalEntry`, `models.get_emoji_and_label`
  - Config: `SAHAY_WEBHOOK_URL` (default: `http://localhost:5678/webhook/sahay-v/assessment`)

---

## 3. Journey & Reflection APIs

### `GET /api/journey/data`
- **Blueprint**: `journey` ([routes/journey.py](file:///d:/antigracvity%20files/SAHAY/routes/journey.py))
- **Purpose**: Fetches aggregated anxiety statistics (Today, Week, Month averages) and time-series line chart values for the requested time horizon.
- **Query Parameters**:
  - `range` (*optional*, string, default: `'week'`): Options: `'day'`, `'week'`, `'month'`.
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "range": "week",
    "summary": {
      "today": {
        "avg": 2.0,
        "emoji": "😌",
        "label": "Calm",
        "count": 2
      },
      "week": {
        "avg": 3.4,
        "emoji": "🙂",
        "label": "Mild",
        "count": 7
      },
      "month": {
        "avg": 3.4,
        "emoji": "🙂",
        "label": "Mild",
        "count": 7
      }
    },
    "chart": {
      "labels": ["Sep 21, 04:21 PM", "Sep 23, 06:21 PM", "Sep 26, 08:22 PM"],
      "values": [3, 6, 2],
      "emojis": ["🙂", "😟", "😌"]
    },
    "timeline": [
      {
        "id": 7,
        "timestamp": "2026-09-26T20:22:42.344943",
        "formatted_time": "Sep 26, 2026 - 08:22 PM",
        "time_only": "08:22 PM",
        "date_only": "Sep 26",
        "anxiety_level": 2,
        "emoji": "😌",
        "label": "Calm",
        "short_thought": "Took a peaceful evening walk",
        "source": "manual"
      }
    ]
  }
  ```
- **Dependencies**: `models.JournalEntry`, `models.get_emoji_and_label`

---

### `POST /api/journey/entry`
- **Blueprint**: `journey` ([routes/journey.py](file:///d:/antigracvity%20files/SAHAY/routes/journey.py))
- **Purpose**: Creates a new anxiety/mood journal entry in the SQLite database.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "anxiety_level": 3,
    "short_thought": "Meditated for 10 minutes before starting work."
  }
  ```
- **Response**:
  - **Created (201 Created)**:
    ```json
    {
      "status": "success",
      "message": "Journal entry saved successfully ✅",
      "entry": {
        "id": 8,
        "timestamp": "2026-09-27T12:20:00.000000",
        "formatted_time": "Sep 27, 2026 - 12:20 PM",
        "time_only": "12:20 PM",
        "date_only": "Sep 27",
        "anxiety_level": 3,
        "emoji": "🙂",
        "label": "Mild",
        "short_thought": "Meditated for 10 minutes before starting work.",
        "source": "manual"
      }
    }
    ```
  - **Validation Error (400 Bad Request)**:
    ```json
    {
      "status": "error",
      "message": "Anxiety level must be between 1 and 10"
    }
    ```
  - **Database Error (500 Internal Server Error)**:
    ```json
    {
      "status": "error",
      "message": "Database save error"
    }
    ```
- **Dependencies**: `models.db`, `models.JournalEntry`
