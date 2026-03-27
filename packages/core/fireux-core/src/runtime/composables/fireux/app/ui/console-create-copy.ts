type ConsoleCreateSurface = 'public' | 'console'

type ResolveConsoleCreateCopyInput = {
  entityLabel: string
  createSurface: ConsoleCreateSurface
  signedIn: boolean
  publicPath: string
  consolePath: string
}

type ConsoleCreateCopy = {
  createPath: string
  targetLabel: string
  label: string
  note: string
  meaning: string
}

const toText = (value: unknown): string => String(value ?? '').trim()

export function resolveConsoleCreateCopy(
  input: ResolveConsoleCreateCopyInput
): ConsoleCreateCopy {
  const entityLabel = toText(input.entityLabel).toLowerCase() || 'entity'
  const isConsoleCreateSurface = input.createSurface === 'console'
  const createPath = isConsoleCreateSurface ? input.consolePath : input.publicPath
  const targetLabel = isConsoleCreateSurface ? `${entityLabel} console` : entityLabel

  return {
    createPath,
    targetLabel,
    label: input.signedIn
      ? `Create ${targetLabel}`
      : `Sign in to create ${targetLabel}`,
    note: input.signedIn
      ? `Create ${targetLabel} routes to ${createPath}.`
      : `Sign in first, then continue to ${createPath} to create the ${targetLabel}.`,
    meaning: isConsoleCreateSurface
      ? `It creates the ${entityLabel} console overlay and creates the public ${entityLabel} only if it does not already exist.`
      : `It creates the public ${entityLabel} first, not the console overlay directly.`,
  }
}
