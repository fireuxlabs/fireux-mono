#!/usr/bin/env node
// FILE: scripts/serve-static-harness.mjs
// Serves the plain external-site harness without adding a package to that static project.

import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicRoot = path.join(repoRoot, 'projects/fireux/no-fireux-embed-test/public')
const port = Number(process.env.PORT || 3025)

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const sourcePreviews = {
  'go-qr-url': [
    'projects/fireux/go-qr/app/pages/tools/url.vue',
    'projects/fireux/go-qr/app/components/GoQr/Provider/Tools/Url.vue',
    'projects/fireux/go-qr/app/components/GoQr/Provider/Frame.vue',
    'projects/fireux/go-qr/server/utils/tools/url.ts',
    'projects/fireux/go-qr/server/api/tools/url/index.get.ts',
  ],
  'go-qr-doc': [
    'projects/fireux/go-qr/app/pages/tools/doc.vue',
    'projects/fireux/go-qr/app/components/GoQr/Provider/Tools/Doc.vue',
    'projects/fireux/go-qr/app/components/GoQr/Provider/Frame.vue',
    'projects/fireux/go-qr/server/utils/tools/doc.ts',
    'projects/fireux/go-qr/server/api/tools/doc/index.get.ts',
  ],
  'go-qr-text': [
    'projects/fireux/go-qr/app/pages/tools/text.vue',
    'projects/fireux/go-qr/app/components/GoQr/Provider/Tools/Text.vue',
    'projects/fireux/go-qr/app/components/GoQr/Provider/Frame.vue',
    'projects/fireux/go-qr/server/utils/tools/text.ts',
    'projects/fireux/go-qr/server/api/tools/text/index.get.ts',
  ],
  'sproochli-menu': [
    'projects/fireux/sproochli/app/pages/tools/menu.vue',
    'projects/fireux/sproochli/app/components/Sproochli/Provider/Tools/Menu.vue',
    'projects/fireux/sproochli/app/components/Sproochli/Provider/Frame.vue',
    'projects/fireux/sproochli/server/utils/tools/menu.ts',
    'projects/fireux/sproochli/server/api/tools/menu/index.get.ts',
  ],
  'misebox-ordering': [
    'projects/misebox/misebox-app/app/pages/tools/ordering.vue',
    'projects/misebox/misebox-app/app/components/Misebox/Provider/Tools/Ordering.vue',
    'projects/misebox/misebox-app/app/components/Misebox/Provider/Frame.vue',
    'projects/misebox/misebox-app/server/utils/tools/ordering.ts',
    'projects/misebox/misebox-app/server/api/tools/ordering/index.get.ts',
  ],
}

function resolvePublicPath(requestUrl = '/') {
  const url = new URL(requestUrl, `http://localhost:${port}`)
  const decodedPath = decodeURIComponent(url.pathname)
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '')
  const withoutLeadingSlash = normalizedPath.replace(/^[/\\]+/, '')
  const requestedPath = path.join(publicRoot, withoutLeadingSlash || 'index.html')
  const relativePath = path.relative(publicRoot, requestedPath)

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return path.join(publicRoot, 'index.html')
  }

  if (existsSync(requestedPath)) return requestedPath

  if (!path.extname(requestedPath)) {
    const htmlPath = `${requestedPath}.html`
    if (existsSync(htmlPath)) return htmlPath
  }

  return requestedPath
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://localhost:${port}`)

  if (url.pathname.startsWith('/__source/')) {
    await serveSourcePreview(url.pathname, response)
    return
  }

  const filePath = resolvePublicPath(request.url)

  try {
    const info = await stat(filePath)
    if (!info.isFile()) throw new Error('Not a file')

    const ext = path.extname(filePath)
    response.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    response.end(await readFile(filePath))
  } catch {
    response.writeHead(404, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    response.end('Not found')
  }
})

async function serveSourcePreview(pathname, response) {
  const key = decodeURIComponent(pathname.replace(/^\/__source\//, '')).trim()
  const files = sourcePreviews[key]

  if (!files) {
    response.writeHead(404, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    response.end(JSON.stringify({ ok: false, reason: 'unknown-source-preview' }))
    return
  }

  const result = []

  for (const rel of files) {
    const filePath = path.join(repoRoot, rel)
    const relativePath = path.relative(repoRoot, filePath)

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) continue

    result.push({
      path: rel,
      content: await readFile(filePath, 'utf8'),
    })
  }

  response.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify({ ok: true, key, files: result }))
}

server.listen(port, () => {
  console.log(`[embed-harness] http://localhost:${port}`)
})
