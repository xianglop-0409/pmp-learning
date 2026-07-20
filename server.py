"""PMP Learning Machine - 带gzip压缩的高性能静态服务器"""
import http.server
import gzip
import os
import mimetypes

PORT = 9000

class GzipHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加缓存头和CORS
        ext = os.path.splitext(self.path)[1]
        if ext in ('.js', '.css', '.svg', '.woff2'):
            self.send_header('Cache-Control', 'public, max-age=86400')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        # SPA fallback: 非文件路径 -> index.html
        path = self.translate_path(self.path)
        if not os.path.exists(path) and '.' not in os.path.basename(self.path):
            self.path = '/index.html'
        super().do_GET()

    def guess_type(self, path):
        # 正确的MIME类型
        mime_map = {
            '.js': 'application/javascript',
            '.mjs': 'application/javascript',
            '.json': 'application/json',
            '.css': 'text/css',
            '.html': 'text/html',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp',
            '.woff2': 'font/woff2',
        }
        ext = os.path.splitext(path)[1].lower()
        return mime_map.get(ext, mimetypes.guess_type(path)[0] or 'application/octet-stream')

# 预压缩大文件
print('⚡ 预压缩 vendor JS...')
vendor_dir = 'js/vendor'
os.makedirs(vendor_dir, exist_ok=True)
for f in os.listdir(vendor_dir):
    if f.endswith('.js') and not f.endswith('.gz'):
        src = os.path.join(vendor_dir, f)
        dst = src + '.gz'
        if not os.path.exists(dst) or os.path.getmtime(src) > os.path.getmtime(dst):
            with open(src, 'rb') as fi:
                with gzip.open(dst, 'wb', compresslevel=9) as fo:
                    fo.write(fi.read())
            orig = os.path.getsize(src)
            comp = os.path.getsize(dst)
            print(f'  ✅ {f}: {orig//1024}KB → {comp//1024}KB (节省{100-comp*100//orig}%)')

print(f'\n🚀 PMP学习机启动: http://localhost:{PORT}')
http.server.HTTPServer(('0.0.0.0', PORT), GzipHandler).serve_forever()
