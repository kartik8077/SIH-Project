from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Render the landing page featuring logo, tagline, and quick navigation cards."""
    return render_template('index.html')
