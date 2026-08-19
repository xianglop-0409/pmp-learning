"""PMP Learning - Sync API Server (port 5001)"""
import http.server, json, hashlib, os, uuid, time, urllib.parse

DATA_FILE = 'data/sync_data.json'
PORT = 5001

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'users': {}, 'progress': {}}

def save_data(data):
    os.makedirs('data', exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

class APIHandler(http.server.BaseHTTPRequestHandler):
    def _send(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        if length == 0: return {}
        return json.loads(self.rfile.read(length).decode())

    def do_OPTIONS(self):
        self._send({})

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        body = self._read_body()
        db = load_data()

        if path == '/api/register':
            username = body.get('username', '').strip()
            password = body.get('password', '').strip()
            if not username or len(password) < 3:
                return self._send({'error': '用户名不能为空，密码至少3位'}, 400)
            if username in db['users']:
                return self._send({'error': '用户名已存在'}, 409)
            token = str(uuid.uuid4())
            db['users'][username] = {'password': hash_pw(password), 'token': token, 'created': time.time()}
            db['progress'][username] = {'nodeProgress': [], 'questionProgress': [], 'examSessions': [], 'lastSync': time.time()}
            save_data(db)
            return self._send({'token': token, 'username': username})

        if path == '/api/login':
            username = body.get('username', '').strip()
            password = body.get('password', '').strip()
            user = db['users'].get(username)
            if not user or user['password'] != hash_pw(password):
                return self._send({'error': '用户名或密码错误'}, 401)
            token = str(uuid.uuid4())
            db['users'][username]['token'] = token
            save_data(db)
            return self._send({'token': token, 'username': username})

        if path == '/api/sync/push':
            token = body.get('token', '')
            username = self._auth(db, token)
            if not username:
                return self._send({'error': '未登录'}, 401)
            if 'progress' not in db or username not in db['progress']:
                db['progress'][username] = {'nodeProgress': [], 'questionProgress': [], 'examSessions': [], 'lastSync': time.time()}
            # Merge: server data overwritten by latest, use lastModified to decide
            for key in ['nodeProgress', 'questionProgress', 'examSessions']:
                if key in body:
                    incoming = body[key]
                    existing = {p.get('nodeId') or p.get('questionId') or p.get('id') or str(i): p for i, p in enumerate(db['progress'][username].get(key, []))}
                    for p in incoming:
                        pid = p.get('nodeId') or p.get('questionId') or p.get('id') or str(p)
                        existing[pid] = p
                    db['progress'][username][key] = list(existing.values())
            db['progress'][username]['lastSync'] = time.time()
            save_data(db)
            return self._send({'ok': True, 'synced': len(body.get('nodeProgress', [])) + len(body.get('questionProgress', []))})

        if path == '/api/sync/pull':
            token = body.get('token', '')
            username = self._auth(db, token)
            if not username:
                return self._send({'error': '未登录'}, 401)
            progress = db['progress'].get(username, {})
            return self._send({'ok': True, 'data': {
                'nodeProgress': progress.get('nodeProgress', []),
                'questionProgress': progress.get('questionProgress', []),
                'examSessions': progress.get('examSessions', []),
                'lastSync': progress.get('lastSync', 0)
            }})

        self._send({'error': 'Unknown API'}, 404)

    def _auth(self, db, token):
        for username, user in db['users'].items():
            if user.get('token') == token:
                return username
        return None

if __name__ == '__main__':
    print(f'Sync API: http://localhost:{PORT}')
    http.server.HTTPServer(('0.0.0.0', PORT), APIHandler).serve_forever()
