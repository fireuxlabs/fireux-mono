type RuntimeConfigRoot = Record<string, any>

type RuntimeDefaultsOptions = {
  merge?: boolean
}

type ConsoleRegistration = {
  family: string
  rootCollection: string
  appSupportCollection?: string
  supportsInlineNotes?: boolean
  appOnboarding?: {
    label: string
    description: string
    primaryEntity: 'required'
    rootOnboardingPath: string
  }
}

type MembershipCleanupRegistration = {
  collection: string
  clearArrayFields?: string[]
  deactivateArrayObjectFields?: string[]
}

function appendUniqueRegistration(
  nuxt: any,
  key: string,
  identity: string,
  registration: Record<string, unknown>
) {
  const rc: RuntimeConfigRoot = (nuxt.options.runtimeConfig ||= {})
  const pub = (rc.public ||= {}) as RuntimeConfigRoot
  const fireux = (pub.fireux ||= {}) as RuntimeConfigRoot
  const current = Array.isArray(fireux[key]) ? fireux[key] : []
  fireux[key] = [
    ...current.filter((entry: unknown) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return true
      return String((entry as Record<string, unknown>)[identity] || '') !==
        String(registration[identity] || '')
    }),
    registration,
  ]
}

export function registerFireuxConsole(
  nuxt: any,
  registration: ConsoleRegistration
) {
  appendUniqueRegistration(nuxt, 'consoleRegistry', 'family', registration)
}

export function registerFireuxMembershipCleanup(
  nuxt: any,
  registration: MembershipCleanupRegistration
) {
  appendUniqueRegistration(
    nuxt,
    'membershipCleanupRegistry',
    'collection',
    registration
  )
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
