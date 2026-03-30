export type ConsoleEntryAuthState = 'unknown' | 'guest' | 'signed-in'

export type ConsoleEntryMode = 'live' | 'demo' | 'test'

export type ConsoleEntryPrimaryAction =
  | 'none'
  | 'sign-in'
  | 'create'
  | 'enter-live'
  | 'enter-demo'
  | 'enter-test'
  | 'enter-bundle'

export type ConsoleEntryCard = {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  badges?: string[]
  mode?: ConsoleEntryMode
}

export type ConsoleEntryInput = {
  entityKey: string
  authState: ConsoleEntryAuthState
  isPremium: boolean
  liveCount: number
  demoCount: number
  canCreateAnother: boolean
  requiresProfileForLive: boolean
  requiresProfileForCreate: boolean
  hasTestMode: boolean
  premiumPreviewEnabled: boolean
}

export type ConsoleEntryPlan = {
  authLane: ConsoleEntryAuthState
  hasLiveItems: boolean
  hasDemoItems: boolean
  hasSingleLive: boolean
  hasSingleDemo: boolean
  showMy: boolean
  showTest: boolean
  showDemo: boolean
  showBundledLive: boolean
  showBundledDemo: boolean
  showPremiumPreviewToggle: boolean
  collapseSecondaryModes: boolean
  canCreate: boolean
  showAddInsideBundle: boolean
  primaryAction: ConsoleEntryPrimaryAction
}
