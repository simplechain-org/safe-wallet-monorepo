import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createGzip } from 'node:zlib'

const root = resolve(process.argv[2] || 'out')
// The reverse proxy routes to port 8080. `PORT=3000` is retained for Next.js
// tooling in the image and must not override the static server port.
const port = Number(process.env.REVERSE_PROXY_UI_PORT || 8080)

createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || '/').split('?')[0])
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '')
  const filePath = resolve(join(root, relativePath))
  const isWithinRoot = filePath === root || filePath.startsWith(`${root}/`)
  const directoryIndex = join(filePath, 'index.html')
  const target = isWithinRoot && existsSync(filePath) && !statSync(filePath).isDirectory()
    ? filePath
    : isWithinRoot && existsSync(directoryIndex)
      ? directoryIndex
      : requestPath === '/'
        ? join(root, 'index.html')
        : undefined

  if (!target || !existsSync(target)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
    return
  }

  const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  }
  const extension = target.slice(target.lastIndexOf('.')).toLowerCase()
  const headers = {
    'Cache-Control': requestPath.startsWith('/_next/static/')
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    Vary: 'Accept-Encoding',
  }

  if (request.method === 'HEAD') {
    response.writeHead(200, headers)
    response.end()
    return
  }

  const acceptsGzip = request.headers['accept-encoding']?.includes('gzip')
  if (acceptsGzip && ['.css', '.html', '.js', '.json', '.mjs', '.svg'].includes(extension)) {
    response.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' })
    createReadStream(target).pipe(createGzip()).pipe(response)
    return
  }

  response.writeHead(200, headers)
  createReadStream(target).pipe(response)
}).listen(port, '0.0.0.0')
