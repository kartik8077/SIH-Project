from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def get_emoji_and_label(level: int) -> tuple[str, str]:
    """
Returns exact emoji and label based on anxiety level (1-10).
Scale:
1-2  😌 Calm
3-4  🙂 Mild
5-6  😟 Moderate
7-8  😰 High
9-10 🥵 Severe
"""
    try:
        level = int(level)
    except (ValueError, TypeError):
        level = 5

    if level <= 2:
        return ('😌', 'Calm')
    elif level <= 4:
        return ('🙂', 'Mild')
    elif level <= 6:
        return ('😟', 'Moderate')
    elif level <= 8:
        return ('😰', 'High')
    return ('🥵', 'Severe')


class JournalEntry(db.Model):
    """SQLAlchemy model for storing mood and anxiety journal entries."""
    __tablename__ = 'journal_entries'

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    anxiety_level = db.Column(db.Integer, nullable=False)
    emoji = db.Column(db.String(10), nullable=False)
    short_thought = db.Column(db.String(200), nullable=True)
    source = db.Column(db.String(20), default='manual', nullable=False)

    def __init__(self, anxiety_level: int, short_thought: str = '', source: str = 'manual', timestamp: datetime = None):
        self.anxiety_level = max(1, min(10, int(anxiety_level)))
        self.emoji, _ = get_emoji_and_label(self.anxiety_level)
        self.short_thought = short_thought.strip() if short_thought else ''
        self.source = source
        if timestamp:
            self.timestamp = timestamp

    def to_dict(self):
        """Serialize object to dictionary for API responses."""
        emoji, label = get_emoji_and_label(self.anxiety_level)
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'formatted_time': self.timestamp.strftime('%b %d, %Y - %I:%M %p'),
            'time_only': self.timestamp.strftime('%I:%M %p'),
            'date_only': self.timestamp.strftime('%b %d'),
            'anxiety_level': self.anxiety_level,
            'emoji': self.emoji,
            'label': label,
            'short_thought': self.short_thought,
            'source': self.source
        }
