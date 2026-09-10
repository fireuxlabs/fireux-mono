import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const root = fileURLToPath(new URL('../..', import.meta.url))
export function getAppRegistryEntries() {
  const apps = []
  for (const group of readdirSync(path.join(root, 'projects'), { withFileTypes: true })) {
    if (!group.isDirectory()) continue
    const ecosystem = group.name
    const folder = path.join(root, 'projects', ecosystem)
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (!entry.isDirectory() || ecosystem === 'templates') continue
      const directory = path.join(folder, entry.name)
      const manifest = path.join(directory, 'package.json')
      if (!existsSync(manifest)) continue
      const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
      const port = /--port[= ](\d+)/.exec(pkg.scripts?.dev ?? '')?.[1]
      if (!port) continue
      const key = entry.name.replace(/-app$/, '')
      apps.push({ key, name: key, ecosystem, directory, port: Number(port),
        role: key === ecosystem ? 'global' : 'app', baseUrl: `http://localhost:${port}` })
    }
  }
  return apps
}
