import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from '../../module'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

function readEnvFile(rootDir: string): Record<string, string> {
  const filePath = join(rootDir, '.env')
  if (!existsSync(filePath)) return {}

  const out: Record<string, string> = {}
  const content = readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/g)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (key) out[key] = value
  }
  return out
}

function envFlag(name: string, envFile: Record<string, string>): boolean | undefined {
  const raw = process.env[name] ?? envFile[name]
  if (typeof raw !== 'string') return undefined
  const value = raw.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(value)) return true
  if (['0', 'false', 'no', 'off'].includes(value)) return false
  return undefined
}

function optEnv(name: string, envFile: Record<string, string>): string | undefined {
  const value = process.env[name] ?? envFile[name]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

export function configureRuntime(nuxt: Nuxt, options: ModuleOptions) {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const publicFireux = (pub.fireux ||= {}) as Record<string, any>
  const envFile = readEnvFile(nuxt.options.rootDir)

  const envEnabled = envFlag('FIREUX_AI_ENABLED', envFile)
  const enabled = envEnabled ?? options.enabled === true
  const provider =
    optEnv('FIREUX_AI_PROVIDER', envFile) || options.provider || 'openai'
  const model =
    optEnv('FIREUX_AI_MODEL', envFile) || options.model || 'gpt-4o-mini'
  const mode =
    optEnv('FIREUX_AI_MODE', envFile) ||
    (envEnabled === true ? 'dev' : options.mode || (enabled ? 'dev' : 'disabled'))

  rc.fireuxAi = {
    enabled,
    provider,
    apiKey: optEnv('FIREUX_AI_API_KEY', envFile),
    model,
    mode,
    ...(rc.fireuxAi && typeof rc.fireuxAi === 'object' ? rc.fireuxAi : {}),
  }

  publicFireux.ai = {
    enabled,
    mode,
    ...(publicFireux.ai && typeof publicFireux.ai === 'object'
      ? publicFireux.ai
      : {}),
  }
}
