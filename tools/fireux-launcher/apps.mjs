import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const root = fileURLToPath(new URL('../..', import.meta.url))
export function getAppRegistryEntries(repoRoot = root) {
  const scripts =
    JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
      .scripts ?? {}
  const apps = []
  for (const group of readdirSync(path.join(repoRoot, 'projects'), {
    withFileTypes: true,
  })) {
    if (!group.isDirectory()) continue
    const ecosystem = group.name
    const folder = path.join(repoRoot, 'projects', ecosystem)
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (!entry.isDirectory() || ecosystem === 'templates') continue
      const directory = path.join(folder, entry.name)
      const manifest = path.join(directory, 'package.json')
      if (!existsSync(manifest)) continue
      const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
      const port = /--port[= ](\d+)/.exec(pkg.scripts?.dev ?? '')?.[1]
      if (!port) continue
      const relative = path
        .relative(repoRoot, directory)
        .split(path.sep)
        .join('/')
      const devScript = Object.keys(scripts).find(
        (name) =>
          name.startsWith('dev:') &&
          scripts[name] === `pnpm --dir ${relative} dev`
      )
      const key = devScript?.slice(4) ?? entry.name.replace(/-app$/, '')
      apps.push({
        key,
        name: key,
        ecosystem,
        directory,
        port: Number(port),
        devScript,
        killScript: scripts[`kill:${key}`] ? `kill:${key}` : undefined,
        role: key === ecosystem ? 'global' : 'app',
        baseUrl: `http://localhost:${port}`,
      })
    }
  }
  for (const field of ['key', 'port']) {
    const seen = new Set()
    for (const app of apps) {
      if (seen.has(app[field]))
        throw new Error(`Duplicate App ${field}: ${app[field]}`)
      seen.add(app[field])
    }
  }
  return apps.sort(
    (left, right) =>
      left.ecosystem.localeCompare(right.ecosystem) || left.port - right.port
  )
}
