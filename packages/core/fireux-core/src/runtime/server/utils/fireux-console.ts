import type { FireuxProjectType } from '../../models/system/project.model'

type BuildFireuxConsoleInput = {
  appId: string
  appName: string
  description: string
  ecosystemId: string
  firebaseProjectId: string
  projectType: FireuxProjectType
  siteUrl: string
}


export function buildFireuxConsoleResponse(input: BuildFireuxConsoleInput) {
  const name = String(input.appName || '').trim()
  const description = String(input.description || '').trim()
  const siteUrl = String(input.siteUrl || '').trim()
  const slug = toSlug(name)
  const consoleEndpointUrl = `${siteUrl}/api/fireux-console`
  const appId = String(input.appId || '').trim()
  const ecosystemId = String(input.ecosystemId || '').trim()
  const firebaseProjectId = String(input.firebaseProjectId || '').trim()

  return {
    ok: true,
    project: {
      id: firebaseProjectId,
      name,
      description,
      slug,
    },
    app: {
      id: appId,
      name,
    },
    ecosystem: {
      id: ecosystemId,
    },
    runtime: {
      project_type: input.projectType,
      source_url: siteUrl,
      console_endpoint_url: consoleEndpointUrl,
      firebase_project_id: firebaseProjectId,
    },
  }
}
