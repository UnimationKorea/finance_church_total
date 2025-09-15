const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const host = '0.0.0.0';

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1><p>새순 교육부 관리 시스템 - 파일을 찾을 수 없습니다.</p>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Sorry, there was an error: ${error.code} ..\n`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, host, () => {
  console.log(`🚀 새순 교육부 관리 시스템 서버가 http://${host}:${port}에서 실행 중입니다`);
  console.log(`📅 시작 시간: ${new Date().toISOString()}`);
});

process.on('SIGINT', () => {
  console.log('\n👋 서버를 종료합니다...');
  server.close(() => {
    console.log('✅ 서버가 안전하게 종료되었습니다.');
    process.exit(0);
  });
});
