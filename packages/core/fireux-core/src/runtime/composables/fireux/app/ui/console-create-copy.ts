type ConsoleCreateSurface = 'public' | 'console'

type ResolveConsoleCreateCopyInput = {
  entityLabel: string
  createSurface: ConsoleCreateSurface
  signedIn: boolean
  publicPath: string
  consolePath: string
  ownedCount?: number
  canOwnMultipleConsoles?: boolean
}

type ConsoleCreateCopy = {
  createPath: string
  targetLabel: string
  label: string
  note: string
  meaning: string
  disabled: boolean
  limitReached: boolean
}

const toText = (value: unknown): string => String(value ?? '').trim()

export function resolveConsoleCreateCopy(
  input: ResolveConsoleCreateCopyInput
): ConsoleCreateCopy {
  const entityLabel = toText(input.entityLabel).toLowerCase() || 'entity'
  const isConsoleCreateSurface = input.createSurface === 'console'
  const createPath = isConsoleCreateSurface ? input.consolePath : input.publicPath
  const targetLabel = entityLabel
  const ownedCount = Math.max(0, Number(input.ownedCount || 0))
  const canOwnMultipleConsoles = Boolean(input.canOwnMultipleConsoles)
  const limitReached =
    input.signedIn &&
    isConsoleCreateSurface &&
    !canOwnMultipleConsoles &&
    ownedCount >= 1

  if (limitReached) {
    return {
      createPath,
      targetLabel,
      label: `Premium required for another ${targetLabel}`,
      note: `Standard users can operate one live ${targetLabel} per app. You already operate ${ownedCount}.`,
      meaning: `Premium unlocks multiple live ${entityLabel} consoles.`,
      disabled: true,
      limitReached: true,
    }
  }

  return {
    createPath,
    targetLabel,
    label: input.signedIn
      ? isConsoleCreateSurface && ownedCount > 0 && canOwnMultipleConsoles
        ? `Add ${targetLabel}`
        : `Create ${targetLabel}`
      : `Sign in to create ${targetLabel}`,
    note: input.signedIn
      ? isConsoleCreateSurface && ownedCount > 0 && canOwnMultipleConsoles
        ? `Add another ${targetLabel} through ${createPath}.`
        : `Create ${targetLabel} routes to ${createPath}.`
      : `Sign in first, then continue to ${createPath} to create the ${targetLabel}.`,
    meaning: isConsoleCreateSurface
      ? `It creates the ${entityLabel} and grants console access in one flow.`
      : `It creates the public ${entityLabel} first, not the console overlay directly.`,
    disabled: false,
    limitReached: false,
  }
}
