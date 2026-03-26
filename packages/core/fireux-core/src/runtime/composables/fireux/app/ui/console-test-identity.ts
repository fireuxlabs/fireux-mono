type ConsoleTestIdentitySource = 'generic' | 'user' | 'profile'

type ResolveConsoleTestIdentityInput = {
  entityLabel: string
  signedIn: boolean
  appAvatarUrl?: unknown
  userDisplayName?: unknown
  userAvatarUrl?: unknown
  profileDisplayName?: unknown
  profileAvatarUrl?: unknown
  genericSubtitle?: string
  userSubtitle?: string
  profileSubtitle?: string
}

type ConsoleTestIdentity = {
  title: string
  subtitle: string
  imageUrl: string
  source: ConsoleTestIdentitySource
}

const ENTITY_COLORS: Record<string, string> = {
  kitchen: '#f59e0b',
  portfolio: '#0ea5e9',
  project: '#6366f1',
  supplier: '#10b981',
}

const toText = (value: unknown): string => String(value ?? '').trim()

const toPossessive = (value: string): string => {
  if (!value) return ''
  return /s$/i.test(value) ? `${value}'` : `${value}'s`
}

const toMonogram = (entityLabel: string): string => {
  const cleaned = toText(entityLabel).replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  return cleaned.slice(0, 2) || 'T'
}

const buildAvatarDataUrl = (entityLabel: string): string => {
  const normalizedEntity = toText(entityLabel).toLowerCase()
  const background = ENTITY_COLORS[normalizedEntity] || '#64748b'
  const monogram = toMonogram(entityLabel)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
      <rect width="96" height="96" rx="24" fill="${background}" />
      <text
        x="48"
        y="54"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="28"
        font-weight="700"
        fill="white"
      >${monogram}</text>
    </svg>
  `.trim()
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function resolveConsoleTestIdentity(
  input: ResolveConsoleTestIdentityInput
): ConsoleTestIdentity {
  const entityLabel = toText(input.entityLabel) || 'Console'
  const appAvatarUrl = toText(input.appAvatarUrl)
  const genericAvatar = buildAvatarDataUrl(entityLabel)
  const userDisplayName = toText(input.userDisplayName)
  const userAvatarUrl = toText(input.userAvatarUrl)
  const profileDisplayName = toText(input.profileDisplayName)
  const profileAvatarUrl = toText(input.profileAvatarUrl)
  const profileName = profileDisplayName || userDisplayName

  if (profileDisplayName || profileAvatarUrl) {
    return {
      title: profileName
        ? `${toPossessive(profileName)} Test ${entityLabel}`
        : `Your Test ${entityLabel}`,
      subtitle: toText(input.profileSubtitle) || `${entityLabel} operator identity ready`,
      imageUrl: profileAvatarUrl || userAvatarUrl || genericAvatar,
      source: 'profile',
    }
  }

  if (input.signedIn) {
    return {
      title: userDisplayName
        ? `${toPossessive(userDisplayName)} Test ${entityLabel}`
        : `Your Test ${entityLabel}`,
      subtitle: toText(input.userSubtitle) || `Personal ${entityLabel.toLowerCase()} test workspace`,
      imageUrl: userAvatarUrl || genericAvatar,
      source: 'user',
    }
  }

  return {
    title: `User1234 Test ${entityLabel}`,
    subtitle: toText(input.genericSubtitle) || 'Sign in to save your progress.',
    imageUrl: appAvatarUrl || genericAvatar,
    source: 'generic',
  }
}
