import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { requireNativeRuntimeLayer } from './runtime-layer'

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  requireNativeRuntimeLayer(resolver, nuxt)
}

/** Keep shared frames stable and fragment-based Dashboard pages unanimated. */
export function configurePageTransitions(nuxt: Nuxt) {
  // The policy needs the layout name before Nuxt generates runtime routes.
  nuxt.options.experimental.extraPageMetaExtractionKeys = [
    ...new Set([
      ...(nuxt.options.experimental.extraPageMetaExtractionKeys || []),
      'layout',
    ]),
  ]
  nuxt.hook('pages:resolved', (pages: any[]) => {
    const applyPolicy = (items: any[], parentLayout?: string | false) => {
      for (const page of items) {
        const layout = page?.meta?.layout ?? parentLayout
        if (
          layout === 'dashboard' ||
          page?.meta?.workspacePage === true ||
          String(page?.path ?? '').startsWith('/workspace') ||
          String(page?.file ?? '').includes('/pages/workspace/')
        ) {
          page.meta = { ...(page.meta || {}), pageTransition: false }
        }
        if (Array.isArray(page?.children)) {
          applyPolicy(page.children, layout)
        }
      }
    }
    applyPolicy(pages)
  })
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
  const filterPages = (pages: any[]) => {
    for (let i = pages.length - 1; i >= 0; i -= 1) {
      const page = pages[i]
      const file = typeof page?.file === 'string' ? page.file : ''

      if (Array.isArray(page?.children)) {
        filterPages(page.children)
      }

      if (file && matchers.some((matcher) => matcher.test(file))) {
        pages.splice(i, 1)
      }
    }
  }

  nuxt.hook('pages:extend', (pages: any[]) => {
    filterPages(pages)
  })
}
