#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(path.join(__dirname, '..'))
const mirrorDir = path.join(repoRoot, 'mirror')
const outDir = path.join(repoRoot, 'docs')
const outFile = path.join(outDir, 'mirror-report.md')

function normalizeRel(p) {
  return p.split(path.sep).join('/')
}

function isTextExt(ext) {
  return ['.ts', '.js', '.mjs', '.json', '.md', '.vue', '.txt', '.css', '.html'].includes(ext)
}

function safeReadUtf8(abs) {
  try {
    return fs.readFileSync(abs, 'utf8')
  } catch (err) {
    return null
  }
}

function listMirrorFiles(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    return entries
      .filter((e) => e.isFile())
      .map((e) => path.join(dir, e.name))
  } catch (err) {
    return []
  }
}

function buildReport() {
  const files = listMirrorFiles(mirrorDir)
  fs.mkdirSync(outDir, { recursive: true })

  const header = `# Mirror Report\n\nGenerated: ${new Date().toISOString()}\n\nTotal files: ${files.length}\n\n`
  let out = header

  for (const abs of files.sort()) {
    const name = path.basename(abs)
    const real = (() => {
      try {
        return fs.realpathSync(abs)
      } catch {
        return null
      }
    })()

    const relShort = `./${normalizeRel(name)}`
    const realDisplay = real ? normalizeRel(path.relative(repoRoot, real)) : '(<unresolved>)'

    out += `===== ${relShort} -> ${realDisplay} =====\n\n`

    if (real) {
      out += `// FILE: ${realDisplay}\n\n`
      const ext = path.extname(real).toLowerCase()
      if (isTextExt(ext)) {
        const content = safeReadUtf8(real)
        if (content === null) {
          out += '[unreadable]\n\n'
        } else {
          // limit extremely large files
          if (Buffer.byteLength(content, 'utf8') > 200 * 1024) {
            out += `[skipped: file too large (${Buffer.byteLength(content, 'utf8')} bytes)]\n\n`
          } else {
            out += content + '\n\n'
          }
        }
      } else {
        out += `[skipped: binary or unsupported ext '${ext}']\n\n`
      }
    } else {
      out += `// target missing: ${abs}\n\n`
    }
  }

  fs.writeFileSync(outFile, out, 'utf8')
  console.log(`mirror-report: generated ${outFile} (${files.length} files)`)
}

buildReport()
