import type { NuxtConfig } from 'nuxt/schema'

type ModuleEntry = string | [string, Record<string, any>]

export interface TenantConfig {
  ecosystem: string
  appName: string
  appShortName: string
  primaryColor: string
  neutralColor?: string
  modules?: ModuleEntry[]
  includeCore?: boolean // default true
}

function dedupeModules(mods: ModuleEntry[] = []): ModuleEntry[] {
  const seen = new Set<string>()
  const out: ModuleEntry[] = []
  for (const m of mods) {
    const id = Array.isArray(m) ? m[0] : m
    if (!seen.has(id)) {
      seen.add(id)
      out.push(m)
    }
  }
  return out
}

export function createFireuxConfig(opts: TenantConfig): NuxtConfig {
  const includeCore = opts.includeCore ?? true
  const base: ModuleEntry[] = includeCore ? ['fireux-core'] : []
  const modules = dedupeModules([...base, ...(opts.modules ?? [])])

  return {
    srcDir: 'app/',
    dir: { public: '../public' },
    imports: { dirs: ['composables/**', 'models/**', 'utils/**'] },
    modules,
    app: { head: { title: opts.appName } },
    runtimeConfig: {
      public: {
        ecosystem: opts.ecosystem,
        appName: opts.appName,
        appShortName: opts.appShortName,
        primaryColor: opts.primaryColor,
        neutralColor: opts.neutralColor,
      },
    },
  }
}
