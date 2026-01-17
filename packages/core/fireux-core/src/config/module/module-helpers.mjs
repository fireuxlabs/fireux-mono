import { addComponent, addComponentsDir, addImportsDir } from '@nuxt/kit'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

export function registerComponentsDir(resolver, relativePath, options = {}) {
  const dir = resolver.resolve(relativePath)
  if (!existsSync(dir)) return null

  const config = {
    path: dir,
    pattern: options.pattern ?? '**/*.vue',
    global: options.global ?? false,
    pathPrefix: options.pathPrefix ?? true,
  }

  if (options.prefix) config.prefix = options.prefix
  if (typeof options.priority === 'number') config.priority = options.priority

  addComponentsDir(config)
  return dir
}

export function registerLayoutsDir(resolver) {
  return registerComponentsDir(resolver, './runtime/layouts', {
    pattern: '**/*.vue',
    global: false,
    pathPrefix: true,
  })
}

export function registerComposablesDir(resolver) {
  const dir = resolver.resolve('./runtime/composables')
  if (!existsSync(dir)) return null
  addImportsDir(dir)
  return dir
}

function toPascalCase(value) {
  return value
    .split(/[\/]/g)
    .map((segment) =>
      segment
        .split(/[-_]/g)
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
        .join('')
    )
    .join('')
}

function walkVueFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      walkVueFiles(fullPath, acc)
    } else if (fullPath.endsWith('.vue')) {
      acc.push(fullPath)
    }
  }
  return acc
}

export function registerComponentAliases(
  resolver,
  relativePath,
  prefix,
  options = {}
) {
  if (!prefix) return null

  const dir = resolver.resolve(relativePath)
  if (!existsSync(dir)) return null

  const files = walkVueFiles(dir)
  for (const filePath of files) {
    const rel = relative(dir, filePath).replace(/\.vue$/i, '')
    const name = `${prefix}${toPascalCase(rel)}`
    addComponent({ name, filePath, global: options.global ?? true })
  }

  return dir
}