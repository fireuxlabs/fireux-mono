import { createJiti } from 'jiti'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { FireuxMetaContent } from '../../runtime/app/literature/types.ts'

export function loadFireuxAppMetaContent(
  explicitMeta?: FireuxMetaContent
): FireuxMetaContent | undefined {
  if (explicitMeta) return explicitMeta

  const appMeta = resolve(process.cwd(), 'app/meta.ts')
  if (!existsSync(appMeta)) {
    throw new Error(`[fireux] Missing required app meta file: ${appMeta}`)
  }

  try {
    const loadTypeScriptModule = createJiti(import.meta.url)
    const loaded = loadTypeScriptModule(appMeta) as {
      metaContent?: FireuxMetaContent
    }
    if (!loaded.metaContent) {
      throw new Error(
        `[fireux] App meta file must export metaContent: ${appMeta}`
      )
    }
    return loaded.metaContent
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `[fireux] Failed to load app meta from ${appMeta}: ${message}`
    )
  }
}
