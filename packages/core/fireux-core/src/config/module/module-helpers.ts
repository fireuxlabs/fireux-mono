import {
  addComponentsDir,
  addImportsDir,
  type Resolver,
} from '@nuxt/kit'
import { existsSync } from 'node:fs'

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
