import type { EcosystemDirectoryEntry } from '../../models/ecosystem-directory'
import type { Ecosystem } from '../../models/ecosystem.model.ts'

/** Add directory-only values derived from the Ecosystem and its related Apps. */
export function toEcosystemDirectoryEntry(
  ecosystem: Ecosystem,
  options: { appCount: number; detailUrl: string }
): EcosystemDirectoryEntry {
  return {
    id: ecosystem.id,
    project_id: ecosystem.project_id,
    status: ecosystem.status,
    name: ecosystem.name,
    ...(ecosystem.description !== undefined
      ? { description: ecosystem.description }
      : {}),
    ...(ecosystem.image_url !== undefined
      ? { image_url: ecosystem.image_url }
      : {}),
    ...(ecosystem.website_url !== undefined
      ? { website_url: ecosystem.website_url }
      : {}),
    detail_url: options.detailUrl,
    app_count: options.appCount,
  }
}
