import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(process.cwd())
const coreRoot = path.join(repoRoot, 'packages', 'core', 'fireux-core', 'src')

const patterns = [
  // Concrete ecosystem config objects should not be defined in fireux-core
  /\bsatisfies\s+FireuxEcosystemConfig\b/,
  /\bas\s+const\s+satisfies\s+FireuxEcosystemConfig\b/,
  /\bexport\s+const\s+ecosystemConfig\b/,
  /\bexport\s+const\s+\w*EcosystemConfig\b/,
]

function walk(dir) {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const full = path.join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      walk(full)
      continue
    }

    if (!full.endsWith('.ts') && !full.endsWith('.js') && !full.endsWith('.mjs')) continue

    const text = readFileSync(full, 'utf8')
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return full
      }
    }
  }

  return null
}

const offender = walk(coreRoot)
if (offender) {
  console.error(`\n[guard-no-core-ecosystem-config] FAIL\n`) 
  console.error(`Concrete ecosystem configs must live in packages/ecosystem/*, not fireux-core.`)
  console.error(`Offending file: ${path.relative(repoRoot, offender)}\n`)
  process.exit(1)
}

console.log('[guard-no-core-ecosystem-config] OK')
