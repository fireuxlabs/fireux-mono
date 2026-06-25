#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)
const outDir = path.join(repoRoot, 'docs')
const outFile = path.join(outDir, 'git-tree.md')

function buildTree(paths) {
  const root = {}
  for (const p of paths) {
    const parts = p.split('/')
    let node = root
    for (const part of parts) {
      if (!node[part]) node[part] = {}
      node = node[part]
    }
  }
  return root
}

function renderMarkdown(node, prefix = '') {
  const keys = Object.keys(node).sort()
  let out = ''
  for (const k of keys) {
    const isLeaf = Object.keys(node[k]).length === 0
    const rel = prefix ? `${prefix}/${k}` : k
    if (isLeaf) {
      out += `- ${rel}\n`
    } else {
      out += `- ${rel}/\n`
      out += indent(renderMarkdown(node[k], rel))
    }
  }
  return out
}

function indent(s) {
  return s
    .split('\n')
    .map((l) => (l ? `  ${l}` : l))
    .join('\n')
}

function main() {
  try {
    const raw = execSync('git ls-files', { cwd: repoRoot, encoding: 'utf8' })
    const files = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)

    // Only include repo files (skip .gitignored results are already filtered by git)
    const tree = buildTree(files)

    fs.mkdirSync(outDir, { recursive: true })
    const header = `# Git Tree\n\nGenerated: ${new Date().toISOString()}\n\nTotal files: ${files.length}\n\n`;
    const body = renderMarkdown(tree)

    let out = header + body

    const includeContent = !!process.env.INCLUDE_CONTENT
    if (includeContent) {
      out += '\n\n## File snippets\n\n'
      // include snippets for reasonable text files only
      const textExt = ['.ts', '.js', '.mjs', '.json', '.md', '.vue', '.txt']
      for (const f of files) {
        try {
          const ext = path.extname(f).toLowerCase()
          if (!textExt.includes(ext)) continue
          const abs = path.join(repoRoot, f)
          const stat = fs.statSync(abs)
          if (stat.size > 20000) continue // skip very large files
          const rawContent = fs.readFileSync(abs, 'utf8')
          const snippet = rawContent.split(/\r?\n/).slice(0, 200).join('\n')
          out += `### ${f}\n\n` + '```' + ext.replace('.', '') + '\n' + snippet + '\n```\n\n'
        } catch (err) {
          // ignore unreadable files
        }
      }
    }

    fs.writeFileSync(outFile, out, 'utf8')
    console.log(`git-tree: generated ${outFile} (${files.length} files) includeContent=${includeContent}`)
  } catch (err) {
    console.error('git-tree: failed:', err?.message || err)
    process.exit(2)
  }
}

main()
