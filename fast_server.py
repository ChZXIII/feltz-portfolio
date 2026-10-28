#!/usr/bin/env python3
import os
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = 8892
DIRECTORY = "/Users/chz/Desktop/Feltz_Studio"

class FastPortfolioHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # High-performance caching & keep-alive
        self.send_header("Connection", "keep-alive")
        self.send_header("Keep-Alive", "timeout=30, max=100")
        
        path = self.path.split("?")[0].lower()
        if path.endswith((".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".ico")):
            self.send_header("Cache-Control", "public, max-age=86400, immutable")
            self.send_header("Access-Control-Allow-Origin", "*")
        elif path.endswith((".woff2", ".woff", ".ttf", ".eot")):
            self.send_header("Cache-Control", "public, max-age=604800, immutable")
            self.send_header("Access-Control-Allow-Origin", "*")
        elif path.endswith((".html", ".htm")) or path == "/":
            self.send_header("Cache-Control", "no-cache, must-revalidate")
        else:
            self.send_header("Cache-Control", "public, max-age=3600")

        super().end_headers()

def run():
    os.chdir(DIRECTORY)
    server_address = ("0.0.0.0", PORT)
    httpd = ThreadingHTTPServer(server_address, FastPortfolioHandler)
    print(f"🚀 [FastServer] Running on http://127.0.0.1:{PORT} & http://0.0.0.0:{PORT} (HTTP/1.1 Multi-Threaded Keep-Alive)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    run()
