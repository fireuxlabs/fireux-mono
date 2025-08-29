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
import { globSync } from 'glob'
import { relative } from 'pathe'

function toGlobalName(file: string) {
  // Expect .../<Dir>/<Name>.model.ts
  const base = file.split(/[\\/]/).pop() || ''
  const name = base.replace(/\.model\.ts$/, '')
  return name
}

export function configureModels(resolver: Resolver) {
  const root = resolver.resolve('.')
  const patterns = [
    resolver.resolve('./runtime/models/profiles/**/*.model.ts'),
    resolver.resolve('./runtime/models/objects/**/*.model.ts'),
  ]
  const files = patterns.flatMap((p) =>
    globSync(p, { windowsPathsNoEscape: true })
  )
  const decls = files
    .map((abs) => {
      const globalName = toGlobalName(abs)
      // Build import path relative to current config root for the template
      const rel = relative(root, abs).replace(/\\/g, '/')
      return `  const ${globalName}: typeof import('${resolver.resolve('./' + rel)}').${globalName}`
    })
    .join('\n')

  addTypeTemplate({
    filename: 'types/misebox-models.d.ts',
    getContents: () => `declare global {\n${decls}\n}\n\nexport {}\n`,
  })
}
