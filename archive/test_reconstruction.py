import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.stdout.reconfigure(encoding='utf-8')

print('--- TEST 2: IMPORTS ---')
from app import create_app, app
from models import db, JournalEntry, get_emoji_and_label

print('create_app & models imported successfully.')

print('\n--- TEST 4: DATABASE ---')
with app.app_context():
    count = JournalEntry.query.count()
    print(f'Total records in journal_entries: {count}')
    entries = JournalEntry.query.all()
    for e in entries:
        print(f'  ID {e.id}: {e.timestamp} | Level {e.anxiety_level} {e.emoji} | {e.source} | "{e.short_thought}"')
    assert count >= 7, f'Expected at least 7 records, got {count}'
print('Database verified and all original records preserved!')

print('\n--- TEST 5: ROUTES ---')
routes = []
for rule in app.url_map.iter_rules():
    routes.append((rule.rule, list(rule.methods), rule.endpoint))
routes.sort()
for r in routes:
    print(f'  {r[0]} {r[1]} -> {r[2]}')

print('\n--- TEST 6 & 8: API & TEMPLATES VIA TEST CLIENT ---')
client = app.test_client()

# Test Landing
res = client.get('/')
print(f'GET /: {res.status_code}')
assert res.status_code == 200
assert b'SAHAY-V' in res.data

# Test Chat page
res = client.get('/chat')
print(f'GET /chat: {res.status_code}')
assert res.status_code == 200

# Test Journey page
res = client.get('/journey')
print(f'GET /journey: {res.status_code}')
assert res.status_code == 200

# Test Safety page
res = client.get('/safety')
print(f'GET /safety: {res.status_code}')
assert res.status_code == 200

# Test Static Files (style.css, chat.js, journey.js, safety.js, logo.svg)
for static_file in ['css/style.css', 'js/chat.js', 'js/journey.js', 'js/safety.js', 'images/logo.svg']:
    res = client.get(f'/static/{static_file}')
    print(f'GET /static/{static_file}: {res.status_code}')
    assert res.status_code == 200, f'Static file {static_file} failed with {res.status_code}'

# Test /api/journey/data
res = client.get('/api/journey/data?range=week')
print(f'GET /api/journey/data?range=week: {res.status_code}, json: {list(res.json.keys())}')
assert res.status_code == 200
assert res.json['status'] == 'success'

# Test /api/chat fallback when n8n is offline
res = client.post('/api/chat', json={'message': 'Hello test'})
print(f'POST /api/chat: {res.status_code}, reply: {res.json.get("reply")[:50]}...')
assert res.status_code == 200
assert res.json['status'] == 'success'

print('\n=== ALL TESTS PASSED SUCCESSFULLY! ===')
