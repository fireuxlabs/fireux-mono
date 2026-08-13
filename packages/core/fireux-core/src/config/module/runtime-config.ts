type RuntimeConfigRoot = Record<string, any>

type RuntimeDefaultsOptions = {
  merge?: boolean
}

export function configureRuntimeDefaults(
  nuxt: any,
  key: string,
  defaults: Record<string, any> = { enabled: true },
  options: RuntimeDefaultsOptions = {}
) {
  if (!key) return
  const rc: RuntimeConfigRoot = (nuxt.options.runtimeConfig ||= {})
  const pub = (rc.public ||= {}) as RuntimeConfigRoot
  if (!pub.fireux) pub.fireux = {}
  const ns = pub.fireux as RuntimeConfigRoot

  if (options.merge) {
    const current = ns[key]
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      ns[key] = { ...defaults, ...current }
      return
    }
  }

  ns[key] ||= { ...defaults }
}