export function configureRuntimeDefaults(
  nuxt,
  key,
  defaults = { enabled: true },
  options = {}
) {
  if (!key) return
  const rc = (nuxt.options.runtimeConfig ||= {})
  const pub = (rc.public ||= {})
  if (!pub.fireux) pub.fireux = {}
  const ns = pub.fireux

  if (options.merge) {
    const current = ns[key]
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      ns[key] = { ...defaults, ...current }
      return
    }
  }

  ns[key] ||= { ...defaults }
}