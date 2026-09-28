import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base application configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'sahay-v-calming-secret-key-default')
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///sahay_v.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SAHAY_WEBHOOK_URL = os.environ.get('SAHAY_WEBHOOK_URL', 'http://localhost:5678/webhook/sahay-v/assessment')
