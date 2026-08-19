"""Upload files to GitHub repo via API"""
import base64, json, urllib.request, sys, os

# Token 从环境变量读取，避免硬编码密钥泄露
TOKEN = os.environ.get('GITHUB_TOKEN', '').strip()
if not TOKEN:
    print('错误: 请先设置环境变量 GITHUB_TOKEN（在终端执行 set GITHUB_TOKEN=你的token）')
    sys.exit(1)
REPO = 'xianglop-0409/pmp-learning'

def get_sha(path):
    url = f'https://api.github.com/repos/{REPO}/contents/{path}'
    req = urllib.request.Request(url, headers={'Authorization': f'token {TOKEN}'})
    resp = json.loads(urllib.request.urlopen(req, timeout=15).read())
    return resp['sha']

def upload(path, message):
    try:
        sha = get_sha(path)
    except:
        sha = None  # New file

    with open(path, 'rb') as f:
        content = base64.b64encode(f.read()).decode()

    payload = {'message': message, 'content': content}
    if sha:
        payload['sha'] = sha

    data = json.dumps(payload).encode()
    url = f'https://api.github.com/repos/{REPO}/contents/{path}'
    req = urllib.request.Request(url, data=data, headers={
        'Authorization': f'token {TOKEN}',
        'Content-Type': 'application/json'
    }, method='PUT')
    resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
    result = resp.get('commit', {}).get('message', resp.get('message', 'OK'))
    print(f'OK {path}: {result}')

if __name__ == '__main__':
    for f in sys.argv[1:]:
        upload(f, f'update: {f}')
