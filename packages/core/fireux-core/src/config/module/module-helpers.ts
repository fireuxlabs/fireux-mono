import {
  addComponent,
  addComponentsDir,
  addImportsDir,
  type Resolver,
} from '@nuxt/kit'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

type ComponentsDirOptions = {
  pattern?: string
  global?: boolean
  pathPrefix?: boolean
  prefix?: string
  priority?: number
}

export function registerComponentsDir(
  resolver: Resolver,
  relativePath: string,
  options: ComponentsDirOptions = {}
) {
  const dir = resolver.resolve(relativePath)
  if (!existsSync(dir)) return null

  const config: Parameters<typeof addComponentsDir>[0] = {
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

export function registerLayoutsDir(resolver: Resolver) {
  return registerComponentsDir(resolver, './runtime/layouts', {
    pattern: '**/*.vue',
    global: false,
    pathPrefix: true,
  })
}

export function registerComposablesDir(resolver: Resolver) {
  const dir = resolver.resolve('./runtime/composables')
  if (!existsSync(dir)) return null
  addImportsDir(dir)
  return dir
}

function toPascalCase(value: string) {
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

function walkVueFiles(dir: string, acc: string[] = []) {
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
  resolver: Resolver,
  relativePath: string,
  prefix: string,
  options: { global?: boolean } = {}
) {
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

export function registerComponentAlias(
  resolver: Resolver,
  relativePath: string,
  name: string,
  options: { global?: boolean } = {}
) {
  if (!name) return null

  const filePath = resolver.resolve(relativePath)
  if (!existsSync(filePath)) return null

  addComponent({ name, filePath, global: options.global ?? true })
  return filePath
}
