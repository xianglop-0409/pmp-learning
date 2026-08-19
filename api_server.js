// PMP Sync API Server - Node.js (zero dependencies)
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 5001;
const DATA_FILE = path.join(__dirname, 'data', 'sync_data.json');

function loadData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return { users: {}, progress: {} }; }
}

function saveData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function hashPw(pw) { return crypto.createHash('sha256').update(pw).digest('hex'); }

function sendJSON(res, data, code = 200) {
  const body = Buffer.from(JSON.stringify(data), 'utf8');
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Length': body.length
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJSON(res, {});

  const url = new URL(req.url, 'http://localhost');
  const db = loadData();

  if (req.method === 'POST' && url.pathname === '/api/register') {
    const body = await readBody(req);
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();
    if (!username || password.length < 3)
      return sendJSON(res, { error: '用户名不能为空，密码至少3位' }, 400);
    if (db.users[username])
      return sendJSON(res, { error: '用户名已存在' }, 409);
    const token = crypto.randomUUID();
    db.users[username] = { password: hashPw(password), token, created: Date.now() };
    db.progress[username] = { nodeProgress: [], questionProgress: [], examSessions: [], lastSync: Date.now() };
    saveData(db);
    return sendJSON(res, { token, username });
  }

  if (req.method === 'POST' && url.pathname === '/api/login') {
    const body = await readBody(req);
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();
    const user = db.users[username];
    if (!user || user.password !== hashPw(password))
      return sendJSON(res, { error: '用户名或密码错误' }, 401);
    const token = crypto.randomUUID();
    db.users[username].token = token;
    saveData(db);
    return sendJSON(res, { token, username });
  }

  if (req.method === 'POST' && url.pathname === '/api/sync/push') {
    const body = await readBody(req);
    const username = Object.keys(db.users).find(u => db.users[u].token === body.token);
    if (!username) return sendJSON(res, { error: '未登录' }, 401);
    if (!db.progress[username])
      db.progress[username] = { nodeProgress: [], questionProgress: [], examSessions: [], lastSync: Date.now() };
    for (const key of ['nodeProgress', 'questionProgress', 'examSessions']) {
      if (body[key]) {
        const existing = {};
        (db.progress[username][key] || []).forEach(p => {
          existing[p.nodeId || p.questionId || p.id || Math.random()] = p;
        });
        body[key].forEach(p => {
          existing[p.nodeId || p.questionId || p.id || Math.random()] = p;
        });
        db.progress[username][key] = Object.values(existing);
      }
    }
    db.progress[username].lastSync = Date.now();
    saveData(db);
    return sendJSON(res, { ok: true });
  }

  if (req.method === 'POST' && url.pathname === '/api/sync/pull') {
    const body = await readBody(req);
    const username = Object.keys(db.users).find(u => db.users[u].token === body.token);
    if (!username) return sendJSON(res, { error: '未登录' }, 401);
    const progress = db.progress[username] || {};
    return sendJSON(res, { ok: true, data: {
      nodeProgress: progress.nodeProgress || [],
      questionProgress: progress.questionProgress || [],
      examSessions: progress.examSessions || [],
      lastSync: progress.lastSync || 0
    }});
  }

  sendJSON(res, { error: 'Not found' }, 404);
});

server.listen(PORT, () => {
  console.log('Sync API: http://localhost:' + PORT);
});
