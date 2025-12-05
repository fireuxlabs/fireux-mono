import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Nuxt } from 'nuxt/schema'

const IGNORE_FILENAME = 'fireux-deploy-ignore'
const DEFAULT_RULES = ['dev']
const ALLOW_DEV_ENV = 'FIREUX_DEPLOY_WITH_DEV'
const RULES_ENV = 'FIREUX_DEPLOY_IGNORE'
const APPLIED_FLAG = '__fireuxDeployIgnoreApplied'

export function configureDeployIgnore(nuxt: Nuxt) {
  const options = nuxt.options as Record<string, any>
  if (options[APPLIED_FLAG]) return
  if (nuxt.options.dev) return
  if (process.env[ALLOW_DEV_ENV] === '1') return

  const rules = resolveIgnoreRules(nuxt)
  if (!rules.length) return

  const rawIgnore: Array<string | RegExp> = Array.isArray(nuxt.options.ignore)
    ? (nuxt.options.ignore as Array<string | RegExp>)
    : []

  const currentIgnore = rawIgnore.map((pattern) =>
    typeof pattern === 'string' ? pattern : pattern.source
  )

  const ignorePatterns = new Set<string>(currentIgnore)
  for (const rule of rules) {
    for (const pattern of toGlobPatterns(rule)) {
      ignorePatterns.add(pattern)
    }
  }

  nuxt.options.ignore = Array.from(ignorePatterns)
  options[APPLIED_FLAG] = true
}

function resolveIgnoreRules(nuxt: Nuxt): string[] {
  const collected = new Set<string>()
  for (const source of [...readRulesFromFile(nuxt), ...readRulesFromEnv()]) {
    const normalized = normalizeRule(source)
    if (normalized) {
      collected.add(normalized)
    }
  }

  if (!collected.size) {
    for (const fallback of DEFAULT_RULES) {
      collected.add(fallback)
    }
  }

  return Array.from(collected)
}

function readRulesFromFile(nuxt: Nuxt): string[] {
  const filePath = join(nuxt.options.rootDir, IGNORE_FILENAME)
  if (!existsSync(filePath)) return []

  return readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.split('#')[0]?.trim() ?? '')
    .filter(Boolean)
}

function readRulesFromEnv(): string[] {
  const raw = process.env[RULES_ENV]
  if (!raw) return []

  return raw
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function normalizeRule(rule: string): string {
  return rule
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
}

function toGlobPatterns(rule: string): string[] {
  const normalized = normalizeRule(rule)
  if (!normalized) return []
  return [`**/${normalized}`, `**/${normalized}/**`]
}
