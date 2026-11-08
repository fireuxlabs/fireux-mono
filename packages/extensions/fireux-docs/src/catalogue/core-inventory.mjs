import { publicComponents } from 'fireux-core/catalogue/public-components'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const roots = [
  ['components', 'Shared', 'Fire'],
  ['app/components', 'App', 'App'],
  ['ecosystem/components', 'Ecosystem', 'Ecosystem'],
  ['user/components', 'User', 'User'],
  ['workspace/components', 'Workspace', 'Workspace'],
]

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(directory, entry.name))
      : entry.name.endsWith('.vue')
        ? [join(directory, entry.name)]
        : []
  )
}

export function coreInventory(
  runtimeRoot,
  components = [],
  previewSource = ''
) {
  const registrations = new Map(
    components.map((component) => [
      resolve(component.filePath),
      component.pascalName,
    ])
  )
  const previews = new Set(
    [...previewSource.matchAll(/name === '([^']+)'/g)].map((match) => match[1])
  )
  return roots
    .flatMap(([directory, scope, prefix]) =>
      files(join(runtimeRoot, directory)).map((file) => {
        const source = relative(runtimeRoot, file).replaceAll('\\', '/')
        const parts = relative(join(runtimeRoot, directory), file)
          .replace(/\.vue$/, '')
          .split(/[\\/]/)
          .filter(
            (part) =>
              !['atoms', 'molecules', 'organisms', 'Index', 'index'].includes(
                part
              )
          )
        const fallback =
          prefix +
          parts
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join('')
        const name = registrations.get(resolve(file)) || fallback
        const code = readFileSync(file, 'utf8')
        const folder = source
          .split('/')
          .slice(1, -1)
          .find((part) => !['atoms', 'molecules', 'organisms'].includes(part))
        const group = folder
          ? folder.charAt(0).toUpperCase() + folder.slice(1)
          : 'Controls'
        return {
          id: source.replace(/\.vue$/, '').replaceAll('/', '--'),
          name,
          source,
          scope,
          group: scope === 'Shared' ? group : scope,
          registered: registrations.has(resolve(file)),
          preview: previews.has(name),
          code,
        }
      })
    )
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Only the explicit Core catalogue is published; the full scan stays build-time. */
export function publicLibrary(
  runtimeRoot,
  components = [],
  previewSource = ''
) {
  const inventory = coreInventory(runtimeRoot, components, previewSource)
  return publicComponents.map((entry) => {
    const component = inventory.find((item) => item.source === entry.source)
    if (!component || component.name !== entry.name)
      throw new Error(
        `Public component source or registration changed: ${entry.name}`
      )
    if (!component.preview)
      throw new Error(`Public component needs a safe preview: ${entry.name}`)
    return { ...component, group: entry.group, description: entry.description }
  })
}
