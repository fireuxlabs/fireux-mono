// JS runtime config helper for runtime consumption
export function configureRuntime(nuxt, key, defaults = { enabled: true }) {
  const rc = nuxt.options.runtimeConfig || {}
  nuxt.options.runtimeConfig = rc
  rc.public ||= {}
  rc.public.mdc ||= {}
  const pub = rc.public
  if (!pub.fireux) pub.fireux = {}
  const fireux = pub.fireux
  fireux[key] = { ...(fireux[key] || {}), ...defaults }
}
