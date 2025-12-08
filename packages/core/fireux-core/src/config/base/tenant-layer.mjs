import { addComponentsDir } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureTenantComponents(resolver, options = {}) {
  const dir = resolver.resolve(options.directory ?? './runtime/components')
  if (!existsSync(dir)) return

  addComponentsDir({
    path: dir,
    prefix: options.prefix,
    global: options.global ?? false,
    pathPrefix: options.pathPrefix ?? false,
  })
}

export function configureTenantLayouts(resolver, _nuxt, options = {}) {
  const dir = resolver.resolve(options.directory ?? './runtime/layouts')
  if (!existsSync(dir)) return

  addComponentsDir({
    path: dir,
    pattern: options.pattern ?? '*.vue',
    prefix: options.prefix,
    global: options.global ?? true,
    pathPrefix: false,
  })
}

export function configureTenantAssets(resolver, nuxt, options = {}) {
  const publicDir = resolver.resolve(options.directory ?? './runtime/public')
  if (!existsSync(publicDir)) return

  const opts = nuxt.options || {}
  nuxt.options = opts
  opts.nitro ||= {}
  opts.nitro.publicAssets ||= []
  opts.nitro.publicAssets.push({
    baseURL: options.baseURL ?? '/',
    dir: publicDir,
    maxAge: options.maxAge ?? 60 * 60 * 24 * 7,
  })

  if (options.alias) {
    opts.alias ||= {}
    opts.alias[options.alias] = publicDir
  }
}
