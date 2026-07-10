import { useRuntimeConfig } from '#imports'
import { useFireUXConfig } from '../fireux/app/FireUXConfig'

export interface DevDriftCopyMeta {
  migration: {
    script: string
    ecosystem: string
    app: string
    firebaseProjectId: string
    appConfigPath: string
    firebaseConfigDir: string
    ecosystemConfigPath: string
  }
}

export function useDevDriftCopyMeta(): DevDriftCopyMeta {
  const cfg = useFireUXConfig()
  const runtimeConfig = useRuntimeConfig()
  const firebaseProjectId =
    (runtimeConfig?.public as any)?.firebaseEcosystem?.firebase?.projectId || 'unknown'
  const ecosystem = cfg.ecosystem || 'unknown'
  const ecosystemSlug = ecosystem.startsWith('fireux-') ? ecosystem : `fireux-${ecosystem}`
  const appId = cfg.appId || 'unknown-app'
  const firebaseConfigDir = `packages/ecosystem/${ecosystemSlug}/src/config/firebase`

  return {
    migration: {
      script: 'scripts/migrate.mjs',
      ecosystem,
      app: appId,
      firebaseProjectId,
      appConfigPath: `projects/${ecosystem}/${appId}/nuxt.config.ts`,
      firebaseConfigDir,
      ecosystemConfigPath: `${firebaseConfigDir}/ecosystem.config.ts`,
    },
  }
}
