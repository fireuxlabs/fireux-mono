import type {
  ConsoleEntryInput,
  ConsoleEntryPlan,
} from './types.console-entry'

const normalizeCount = (value: unknown): number => {
  const count = Number(value)
  return Number.isFinite(count) && count > 0 ? count : 0
}

export function resolveConsoleEntryPlan(
  input: ConsoleEntryInput
): ConsoleEntryPlan {
  const authLane = input.authState
  const liveCount = normalizeCount(input.liveCount)
  const demoCount = normalizeCount(input.demoCount)

  const hasLiveItems = liveCount > 0
  const hasDemoItems = demoCount > 0
  const hasSingleLive = liveCount === 1
  const hasSingleDemo = demoCount === 1

  const showMy = authLane === 'signed-in'
  const showTest = input.hasTestMode
  const showDemo = hasDemoItems
  const canCreate = authLane === 'signed-in' && input.canCreateAnother

  const showPremiumPreviewToggle =
    authLane === 'signed-in' &&
    !input.isPremium &&
    demoCount > 1

  const showBundledLive =
    authLane === 'signed-in' &&
    input.isPremium &&
    liveCount > 1

  const showBundledDemo =
    authLane === 'signed-in' &&
    demoCount > 1 &&
    (input.isPremium || input.premiumPreviewEnabled)

  const collapseSecondaryModes =
    authLane === 'signed-in' &&
    input.isPremium &&
    hasLiveItems &&
    (showTest || showDemo)

  const showAddInsideBundle = showBundledLive && canCreate

  let primaryAction: ConsoleEntryPlan['primaryAction'] = 'none'

  if (authLane === 'guest') {
    if (showTest) primaryAction = 'enter-test'
    else if (hasDemoItems) primaryAction = 'enter-demo'
    else primaryAction = 'sign-in'
  } else if (authLane === 'signed-in') {
    if (showBundledLive) primaryAction = 'enter-bundle'
    else if (hasSingleLive) primaryAction = 'enter-live'
    else if (canCreate) primaryAction = 'create'
    else if (showBundledDemo || hasSingleDemo) primaryAction = 'enter-demo'
    else if (showTest) primaryAction = 'enter-test'
  }

  return {
    authLane,
    hasLiveItems,
    hasDemoItems,
    hasSingleLive,
    hasSingleDemo,
    showMy,
    showTest,
    showDemo,
    showBundledLive,
    showBundledDemo,
    showPremiumPreviewToggle,
    collapseSecondaryModes,
    canCreate,
    showAddInsideBundle,
    primaryAction,
  }
}
