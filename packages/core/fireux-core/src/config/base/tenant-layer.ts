import { addComponentsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'node:fs'

export interface TenantComponentOptions {
  prefix?: string
  global?: boolean
  pathPrefix?: boolean
  directory?: string
}

export function configureTenantComponents(
  resolver: Resolver,
  options: TenantComponentOptions = {}
) {
  const dir = resolver.resolve(options.directory ?? './runtime/components')
  if (!existsSync(dir)) return

  addComponentsDir({
    path: dir,
    prefix: options.prefix,
    global: options.global ?? false,
    pathPrefix: options.pathPrefix ?? false,
  })
}

export interface TenantLayoutOptions {
  prefix?: string
  pattern?: string
  global?: boolean
  directory?: string
}

export function configureTenantLayouts(
  resolver: Resolver,
  _nuxt: Nuxt | undefined,
  options: TenantLayoutOptions = {}
) {
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

export interface TenantAssetOptions {
  alias?: string
  baseURL?: string
  maxAge?: number
  directory?: string
}

export function configureTenantAssets(
  resolver: Resolver,
  nuxt: Nuxt,
  options: TenantAssetOptions = {}
) {
  const publicDir = resolver.resolve(options.directory ?? './runtime/public')
  if (!existsSync(publicDir)) return

  const opts = nuxt.options as any
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
