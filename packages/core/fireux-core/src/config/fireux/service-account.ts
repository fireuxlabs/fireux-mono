import { resolve as pathResolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { env, resolveWorkspaceRoot } from './env'

export type ServiceAccountPayload = {
  credentials: {
    projectId: string
    clientEmail: string
    privateKey: string
  }
  json: string
}

function toServiceAccountPayload(
  input: Record<string, unknown>
): ServiceAccountPayload | undefined {
  const projectId = input.project_id ?? input.projectId
  const clientEmail = input.client_email ?? input.clientEmail
  const rawKey = input.private_key ?? input.privateKey

  if (typeof projectId !== 'string' || !projectId.trim()) return undefined
  if (typeof clientEmail !== 'string' || !clientEmail.trim()) return undefined
  if (typeof rawKey !== 'string' || !rawKey.trim()) return undefined

  let normalizedKey = rawKey
  if (rawKey.includes('\\n')) {
    normalizedKey = rawKey.replace(/\\n/g, '\n')
  }

  const escapedKey = normalizedKey.replace(/\n/g, String.raw`\n`)

  const json = JSON.stringify(
    {
      project_id: projectId,
      client_email: clientEmail,
      private_key: escapedKey,
    },
    null,
    2
  )

  return {
    credentials: {
      projectId,
      clientEmail,
      privateKey: normalizedKey,
    },
    json,
  }
}

function readServiceAccountFromFile(
  path: string
): ServiceAccountPayload | undefined {
  try {
    const raw = readFileSync(path, 'utf-8')
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return toServiceAccountPayload(parsed)
  } catch {
    return undefined
  }
}

function readServiceAccountFromInline(): ServiceAccountPayload | undefined {
  const inlineJson = env('FIREBASE_SERVICE_ACCOUNT')
  if (!inlineJson) return undefined
  try {
    const parsed = JSON.parse(inlineJson) as Record<string, unknown>
    return toServiceAccountPayload(parsed)
  } catch {
    return undefined
  }
}

function readServiceAccountFromSplitEnv(): ServiceAccountPayload | undefined {
  const projectId = env('FIREBASE_PROJECT_ID')
  const clientEmail = env('FIREBASE_CLIENT_EMAIL')
  const rawKey = env('FIREBASE_PRIVATE_KEY')
  if (!projectId || !clientEmail || !rawKey) return undefined

  return toServiceAccountPayload({
    project_id: projectId,
    client_email: clientEmail,
    private_key: rawKey,
  })
}

function serviceAccountCandidatePaths(ecosystem: string): string[] {
  const fileEnv = env('FIREBASE_SERVICE_ACCOUNT_FILE')
  const gcloudCredentials = env('GOOGLE_APPLICATION_CREDENTIALS')
  const workspaceRoot = resolveWorkspaceRoot()
  const cwd = process.cwd()
  const paths = new Set<string>()

  const addPath = (candidate: string) => {
    if (!candidate) return
    if (/^\s*$/.test(candidate)) return

    if (candidate.startsWith('file://')) {
      try {
        const url = new URL(candidate)
        paths.add(fileURLToPath(url))
        return
      } catch {
        return
      }
    }

    if (pathResolve(candidate) === candidate && candidate.startsWith('/')) {
      paths.add(candidate)
      return
    }

    paths.add(pathResolve(cwd, candidate))
    paths.add(pathResolve(workspaceRoot, candidate))
  }

  addPath(fileEnv ?? '')
  addPath(gcloudCredentials ?? '')

  const relativeCandidates = [
    `packages/ecosystem/fireux-${ecosystem}/config/service-account.json`,
    `packages/ecosystem/${ecosystem}/config/service-account.json`,
  ]

  for (const relative of relativeCandidates) {
    paths.add(pathResolve(workspaceRoot, relative))
  }

  return Array.from(paths)
}

function readServiceAccountFromFiles(
  ecosystem: string
): ServiceAccountPayload | undefined {
  for (const candidate of serviceAccountCandidatePaths(ecosystem)) {
    if (!existsSync(candidate)) continue
    const payload = readServiceAccountFromFile(candidate)
    if (payload) return payload
  }
  return undefined
}

export function readServiceAccount(
  ecosystem: string
): ServiceAccountPayload | undefined {
  return (
    readServiceAccountFromInline() ??
    readServiceAccountFromSplitEnv() ??
    readServiceAccountFromFiles(ecosystem)
  )
}
