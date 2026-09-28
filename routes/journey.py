from datetime import datetime, timedelta
from flask import Blueprint, render_template, request, jsonify
from models import db, JournalEntry, get_emoji_and_label

journey_bp = Blueprint('journey', __name__)

@journey_bp.route('/journey')
def journey_page():
    """Render the My Journey dashboard page."""
    return render_template('journey.html')

@journey_bp.route('/api/journey/data', methods=['GET'])
def get_journey_data():
    """
    Returns aggregated summary averages (Today, Week, Month) and
    time-series chart data based on query range ('day', 'week', 'month').
    """
    selected_range = request.args.get('range', 'week').lower()
    now = datetime.utcnow()

    # Determine date cutoffs
    today_start = datetime(now.year, now.month, now.day)
    week_start = now - timedelta(days=7)
    month_start = now - timedelta(days=30)

    # 1. Fetch Today average
    today_entries = JournalEntry.query.filter(JournalEntry.timestamp >= today_start).all()
    today_avg = round(sum(e.anxiety_level for e in today_entries) / len(today_entries), 1) if today_entries else None
    today_emoji, today_label = get_emoji_and_label(today_avg) if today_avg else ("—", "No logs today")

    # 2. Fetch Week average
    week_entries_all = JournalEntry.query.filter(JournalEntry.timestamp >= week_start).all()
    week_avg = round(sum(e.anxiety_level for e in week_entries_all) / len(week_entries_all), 1) if week_entries_all else None
    week_emoji, week_label = get_emoji_and_label(week_avg) if week_avg else ("—", "No logs this week")

    # 3. Fetch Month average
    month_entries_all = JournalEntry.query.filter(JournalEntry.timestamp >= month_start).all()
    month_avg = round(sum(e.anxiety_level for e in month_entries_all) / len(month_entries_all), 1) if month_entries_all else None
    month_emoji, month_label = get_emoji_and_label(month_avg) if month_avg else ("—", "No logs this month")

    # 4. Filter entries for timeline list & chart according to selected range
    if selected_range == 'day':
        cutoff = today_start
    elif selected_range == 'month':
        cutoff = month_start
    else:  # default week
        cutoff = week_start

    entries_query = JournalEntry.query.filter(JournalEntry.timestamp >= cutoff).order_by(JournalEntry.timestamp.asc()).all()

    # Format chart labels & values
    chart_labels = []
    chart_values = []
    chart_emojis = []

    for entry in entries_query:
        if selected_range == 'day':
            time_str = entry.timestamp.strftime('%I:%M %p')
        else:
            time_str = entry.timestamp.strftime('%b %d, %I:%M %p')
            
        chart_labels.append(time_str)
        chart_values.append(entry.anxiety_level)
        chart_emojis.append(entry.emoji)

    # Convert entries to list dict for timeline display (newest first)
    timeline_entries = [e.to_dict() for e in reversed(entries_query)]

    return jsonify({
        'status': 'success',
        'range': selected_range,
        'summary': {
            'today': {'avg': today_avg, 'emoji': today_emoji, 'label': today_label, 'count': len(today_entries)},
            'week': {'avg': week_avg, 'emoji': week_emoji, 'label': week_label, 'count': len(week_entries_all)},
            'month': {'avg': month_avg, 'emoji': month_emoji, 'label': month_label, 'count': len(month_entries_all)}
        },
        'chart': {
            'labels': chart_labels,
            'values': chart_values,
            'emojis': chart_emojis
        },
        'timeline': timeline_entries
    })

@journey_bp.route('/api/journey/entry', methods=['POST'])
def add_journey_entry():
    """
    Saves a manual anxiety/mood entry.
    Request JSON: { "anxiety_level": 1-10, "short_thought": "..." }
    """
    data = request.get_json() or {}
    try:
        anxiety_level = int(data.get('anxiety_level', 5))
    except (ValueError, TypeError):
        return jsonify({'status': 'error', 'message': 'Invalid anxiety level'}), 400

    if not (1 <= anxiety_level <= 10):
        return jsonify({'status': 'error', 'message': 'Anxiety level must be between 1 and 10'}), 400

    short_thought = data.get('short_thought', '').strip()[:200]

    try:
        entry = JournalEntry(
            anxiety_level=anxiety_level,
            short_thought=short_thought,
            source='manual'
        )
        db.session.add(entry)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Journal entry saved successfully ✅',
            'entry': entry.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': 'Database save error'}), 500
