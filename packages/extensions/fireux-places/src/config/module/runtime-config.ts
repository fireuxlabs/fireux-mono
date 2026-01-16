export function configureRuntime(
  nuxt: any,
  key: string,
  defaults: Record<string, any> = { enabled: true }
) {
  const rc = (nuxt.options.runtimeConfig ||= {})
  const pub = (rc.public ||= {})
  if (!pub.fireux) pub.fireux = {}
  const ns = pub.fireux as Record<string, any>

  const current = ns[key]
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    ns[key] = { ...defaults, ...current }
    return
  }

  ns[key] = { ...defaults }
}