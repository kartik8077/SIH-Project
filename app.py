from datetime import datetime, timedelta
import os
from flask import Flask
from config import Config
from models import db, JournalEntry
from routes.main import main_bp
from routes.chat import chat_bp
from routes.journey import journey_bp
from routes.safety import safety_bp


def create_app(config_class=Config):
    """
Application factory for SAHAY-V Flask Web Application.
Configures SQLAlchemy, registers blueprints, and creates database tables.
"""
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    db.init_app(app)

    app.register_blueprint(main_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(journey_bp)
    app.register_blueprint(safety_bp)

    with app.app_context():
        db.create_all()
        seed_sample_data_if_empty()

    return app


def seed_sample_data_if_empty():
    """Seeds initial demonstration data if database has no records."""
    if JournalEntry.query.first() is not None:
        return

    now = datetime.utcnow()
    sample_entries = [
        JournalEntry(
            anxiety_level=3,
            short_thought='Morning coffee reflection. Feeling peaceful.',
            source='manual',
            timestamp=now - timedelta(days=5, hours=4)
        ),
        JournalEntry(
            anxiety_level=6,
            short_thought='Work deadline pressure building up.',
            source='manual',
            timestamp=now - timedelta(days=3, hours=2)
        ),
        JournalEntry(
            anxiety_level=5,
            short_thought='AI Chat Assessment: Discussed evening anxiety...',
            source='chat',
            timestamp=now - timedelta(days=2, hours=6)
        ),
        JournalEntry(
            anxiety_level=4,
            short_thought='Took a 15-min walk outside. Feeling lighter.',
            source='manual',
            timestamp=now - timedelta(days=1, hours=3)
        ),
        JournalEntry(
            anxiety_level=2,
            short_thought='Practiced 5-4-3-2-1 grounding exercise. Very calm.',
            source='manual',
            timestamp=now - timedelta(hours=5)
        ),
    ]
    db.session.bulk_save_objects(sample_entries)
    db.session.commit()


app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
