/**
 * Models Configuration for FireUX Misebox
 *
 * Auto-import all model interfaces in runtime/models/{profiles,objects} using a glob.
 * Each model file exporting an interface named after the file (PascalCase + .model.ts)
 * will be exposed as a global constant referencing its type.
 *
 * Example: runtime/models/objects/Ingredient.model.ts -> global const Ingredient
 */
import type { Resolver } from '@nuxt/kit'
import { addTypeTemplate } from '@nuxt/kit'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

function toGlobalName(file: string) {
  // Expect .../<Dir>/<Name>.model.ts
  const base = file.split(/[\\/]/).pop() || ''
  const name = base.replace(/\.model\.ts$/, '')
  return name
}

export function configureModels(resolver: Resolver) {
  const root = resolver.resolve('.')

  function walk(dir: string, acc: string[] = []): string[] {
    let entries: string[] = []
    try {
      entries = readdirSync(dir)
    } catch {
      return acc
    }
    for (const name of entries) {
      const abs = join(dir, name)
      let s
      try {
        s = statSync(abs)
      } catch {
        continue
      }
      if (s.isDirectory()) {
        walk(abs, acc)
      } else if (name.endsWith('.model.ts')) {
        acc.push(abs)
      }
    }
    return acc
  }

  const files = [
    resolver.resolve('./runtime/models/profiles'),
    resolver.resolve('./runtime/models/objects'),
  ].flatMap((d) => walk(d))

  const decls = files
    .map((abs) => {
      const globalName = toGlobalName(abs)
      const rel = relative(root, abs).replace(/\\/g, '/')
      return `  const ${globalName}: typeof import('${resolver.resolve('./' + rel)}').${globalName}`
    })
    .join('\n')

  addTypeTemplate({
    filename: 'types/misebox-models.d.ts',
    getContents: () => `declare global {\n${decls}\n}\n\nexport {}\n`,
  })
}
