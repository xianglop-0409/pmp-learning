"""PMP Learning Machine - Static Server"""
import http.server
import os

PORT = 9000

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) and '.' not in os.path.basename(self.path):
            self.path = '/index.html'
        super().do_GET()

    def guess_type(self, path):
        mime_map = {
            '.js': 'application/javascript',
            '.mjs': 'application/javascript',
            '.json': 'application/json',
            '.css': 'text/css',
            '.html': 'text/html',
            '.svg': 'image/svg+xml',
        }
        ext = os.path.splitext(path)[1].lower()
        return mime_map.get(ext, super().guess_type(path))

print(f'PMP Learning: http://localhost:{PORT}')
http.server.HTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
