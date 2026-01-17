function ensure(nuxt) {
  const root = nuxt?.options ?? nuxt
  const runtime = (root.runtimeConfig ||= {})
  const pub = (runtime.public ||= {})
  return { runtime, pub }
}

export function setRuntime(nuxt, s) {
  const { runtime, pub } = ensure(nuxt)

  if (s.app) pub.fireux = { ...(pub.fireux || {}), ...s.app }
  if (s.firebaseEcosystem)
    pub.firebaseEcosystem = {
      ...(pub.firebaseEcosystem || {}),
      ...s.firebaseEcosystem,
    }
  if (s.firebaseApp)
    pub.firebaseApp = { ...(pub.firebaseApp || {}), ...s.firebaseApp }
  if (s.private) runtime.fireux = { ...(runtime.fireux || {}), ...s.private }
}

export function setRuntimeApp(nuxt, c) {
  setRuntime(nuxt, { app: c })
}

export function setRuntimeFirebaseEcosystem(nuxt, c) {
  setRuntime(nuxt, { firebaseEcosystem: c })
}

export function setRuntimeFirebaseApp(nuxt, c) {
  setRuntime(nuxt, { firebaseApp: c })
}

export function setRuntimePrivate(nuxt, c) {
  setRuntime(nuxt, { private: c })
}