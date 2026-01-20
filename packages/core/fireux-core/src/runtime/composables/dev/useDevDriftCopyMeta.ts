import { useFireUXConfig } from '../fireux/app/FireUXConfig'

export interface DevDriftCopyMeta {
  migration: {
    script: string
    ecosystem: string
    app: string
    appConfigPath: string
    firebaseConfigDir: string
    ecosystemConfigPath: string
    serviceAccountPath: string
  }
}

export function useDevDriftCopyMeta(): DevDriftCopyMeta {
  const cfg = useFireUXConfig()
  const ecosystem = cfg.ecosystem || 'unknown'
  const ecosystemSlug = ecosystem.startsWith('fireux-') ? ecosystem : `fireux-${ecosystem}`
  const appId = cfg.appId || 'unknown-app'
  const firebaseConfigDir = `packages/ecosystem/${ecosystemSlug}/src/config/firebase`

  return {
    migration: {
      script: 'scripts/migrate.mjs',
      ecosystem,
      app: appId,
      appConfigPath: `projects/${ecosystem}/${appId}/nuxt.config.ts`,
      firebaseConfigDir,
      ecosystemConfigPath: `${firebaseConfigDir}/ecosystem.config.ts`,
      serviceAccountPath: `${firebaseConfigDir}/service-account.json`,
    },
  }
}
