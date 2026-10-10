import { existsSync } from 'node:fs'
import { join, resolve as pathResolve } from 'node:path'

export function findRepoRoot(start: string): string {
  let current = start
  for (let index = 0; index < 10; index += 1) {
    if (
      existsSync(join(current, 'pnpm-workspace.yaml')) ||
      existsSync(join(current, '.git'))
    ) {
      return current
    }
    const parent = pathResolve(current, '..')
    if (parent === current) break
    current = parent
  }
  return current
}
