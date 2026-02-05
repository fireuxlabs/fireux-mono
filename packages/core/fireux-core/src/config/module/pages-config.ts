import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { ensureRuntimeLayer } from './runtime-layer'

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  ensureRuntimeLayer(resolver, nuxt)
}

function globToRegex(pattern: string) {
  let regex = '^'
  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i]
    if (char === '*') {
      const next = pattern[i + 1]
      if (next === '*') {
        regex += '.*'
        i += 1
      } else {
        regex += '[^/]*'
      }
    } else if (char === '?') {
      regex += '[^/]'
    } else {
      regex += char.replace(/[\\^$+?.()|[\]{}]/g, '\\$&')
    }
  }
  regex += '$'
  return new RegExp(regex)
}

export function filterPagesByGlob(nuxt: Nuxt, patterns: string[]) {
  const matchers = patterns.map((pattern) => globToRegex(pattern))
  nuxt.hook('pages:extend', (pages: any[]) => {
    for (let i = pages.length - 1; i >= 0; i -= 1) {
      const page = pages[i]
      const file = typeof page?.file === 'string' ? page.file : ''
      if (!file) continue
      if (matchers.some((matcher) => matcher.test(file))) {
        pages.splice(i, 1)
      }
    }
  })
}
