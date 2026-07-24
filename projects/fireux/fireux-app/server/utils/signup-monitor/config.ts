export type SignupMonitorSourceScope = {
  serviceAccountEmail: string
  firebaseProjectId: string
  databaseId: string
  projectId: string
  ecosystemId: string
  appIds: string[]
}

export type SignupMonitorReceiverConfig = {
  enabled: boolean
  audience: string
  sources: SignupMonitorSourceScope[]
}

function text(value: unknown) {
  return String(value ?? '').trim()
}

function parseSources(value: string): SignupMonitorSourceScope[] {
  if (!value.trim()) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('Signup monitor source scopes are invalid.')
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Signup monitor source scopes are invalid.')
  }

  return parsed.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error('Signup monitor source scopes are invalid.')
    }
    const source = entry as Record<string, unknown>
    const appIds = Array.isArray(source.app_ids)
      ? [...new Set(source.app_ids.map(text).filter(Boolean))]
      : []
    const scope = {
      serviceAccountEmail: text(source.service_account_email).toLowerCase(),
      firebaseProjectId: text(source.firebase_project_id),
      databaseId: text(source.database_id),
      projectId: text(source.project_id),
      ecosystemId: text(source.ecosystem_id),
      appIds,
    }
    if (
      !scope.serviceAccountEmail ||
      !scope.firebaseProjectId ||
      !scope.databaseId ||
      !scope.projectId ||
      !scope.appIds.length
    ) {
      throw new Error('Signup monitor source scopes are invalid.')
    }
    return scope
  })
}

export function getSignupMonitorReceiverConfig(): SignupMonitorReceiverConfig {
  return {
    enabled:
      String(process.env.FIREUX_SIGNUP_MONITOR_RECEIVER_ENABLED || '') ===
      'true',
    audience: text(process.env.FIREUX_SIGNUP_MONITOR_OIDC_AUDIENCE),
    sources: parseSources(
      String(process.env.FIREUX_SIGNUP_MONITOR_SOURCE_SCOPES || '')
    ),
  }
}

export function sourceScopeAllows(
  scope: SignupMonitorSourceScope,
  input: {
    serviceAccountEmail: string
    firebaseProjectId: string
    databaseId: string
    projectId: string
    ecosystemId: string
    appId: string
  }
) {
  return (
    scope.serviceAccountEmail === input.serviceAccountEmail.toLowerCase() &&
    scope.firebaseProjectId === input.firebaseProjectId &&
    scope.databaseId === input.databaseId &&
    scope.projectId === input.projectId &&
    scope.ecosystemId === input.ecosystemId &&
    scope.appIds.includes(input.appId)
  )
}
