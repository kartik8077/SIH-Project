import uuid
import requests
from flask import Blueprint, render_template, request, jsonify, current_app
from models import db, JournalEntry, get_emoji_and_label

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat')
def chat_page():
    """Render the AI Chat Companion interface."""
    return render_template('chat.html')

@chat_bp.route('/api/chat', methods=['POST'])
def api_chat():
    """
    Proxy endpoint for the n8n AI Assessment Agent.
    Forwards user message and session_id to SAHAY_WEBHOOK_URL.
    Auto-logs anxiety score to database if provided in n8n response.
    """
    data = request.get_json() or {}
    user_message = data.get('message', '').strip()
    session_id = data.get('session_id') or str(uuid.uuid4())

    if not user_message:
        return jsonify({
            'status': 'error',
            'reply': 'Please write a message so I can listen and help. 🤍'
        }), 400

    webhook_url = current_app.config.get(
        'SAHAY_WEBHOOK_URL', 
        'http://localhost:5678/webhook/sahay-v/assessment'
    )

    payload = {
        'message': user_message,
        'session_id': session_id
    }

    agent_reply = ""
    anxiety_score = None
    logged_entry = None

    try:
        # POST to n8n webhook with an 8-second timeout
        response = requests.post(webhook_url, json=payload, timeout=8)
        
        if response.status_code == 200:
            try:
                res_data = response.json()
                
                # Handle array of responses or dict
                if isinstance(res_data, list) and len(res_data) > 0:
                    res_data = res_data[0]

                if isinstance(res_data, dict):
                    # Extract reply text from common n8n node keys
                    agent_reply = (
                        res_data.get('output') or 
                        res_data.get('reply') or 
                        res_data.get('message') or 
                        res_data.get('response') or 
                        res_data.get('text') or 
                        str(res_data)
                    )
                    
                    # Search for numerical assessment score in response keys
                    score_candidates = [
                        res_data.get('anxiety_score'),
                        res_data.get('anxiety_level'),
                        res_data.get('score'),
                        res_data.get('vulnerability_score'),
                        res_data.get('assessment_score')
                    ]
                    for candidate in score_candidates:
                        if candidate is not None:
                            try:
                                anxiety_score = int(float(candidate))
                                break
                            except (ValueError, TypeError):
                                continue
                else:
                    agent_reply = str(res_data)

            except ValueError:
                # If n8n returns raw non-JSON text
                agent_reply = response.text if response.text else "I am listening... 🤍"
        else:
            # Non-200 response from webhook
            agent_reply = (
                "I am right here with you 🤍. I experienced a brief pause in reaching my assessment engine, "
                "but take a calm, deep breath. Would you like to share what's on your mind?"
            )
            
    except requests.exceptions.Timeout:
        agent_reply = (
            "I'm taking a moment to gather my thoughts... 🌸 Please take a deep breath with me. "
            "How are you feeling in this moment?"
        )
    except requests.exceptions.RequestException as e:
        # Graceful connection error fallback without stack traces
        agent_reply = (
            "I'm here with you 🤍. My connection to the assessment service is currently resting, "
            "but your feelings matter deeply. Take a gentle breath and explore your Journey or Safety tools."
        )

    # Ensure agent reply is non-empty
    if not agent_reply or not str(agent_reply).strip():
        agent_reply = "I hear you, and you are not alone 🤍. Take your time."

    # If an anxiety score was detected from n8n assessment, auto-log to database
    if anxiety_score is not None and 1 <= anxiety_score <= 10:
        try:
            entry = JournalEntry(
                anxiety_level=anxiety_score,
                short_thought=f"AI Chat Assessment: {user_message[:60]}...",
                source="chat"
            )
            db.session.add(entry)
            db.session.commit()
            logged_entry = entry.to_dict()
        except Exception:
            db.session.rollback()

    emoji = None
    label = None
    if anxiety_score:
        emoji, label = get_emoji_and_label(anxiety_score)

    return jsonify({
        'status': 'success',
        'reply': agent_reply,
        'session_id': session_id,
        'anxiety_score': anxiety_score,
        'emoji': emoji,
        'label': label,
        'auto_logged': logged_entry is not None
    })
