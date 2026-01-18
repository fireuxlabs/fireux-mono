import { useFireUXConfig } from '../fireux/app/FireUXConfig'

export interface DevDriftCopyMeta {
  ecosystem: string
  migration: {
    script: string
    configDir: string
    ecosystemConfig: string
    serviceAccount: string
  }
}

export function useDevDriftCopyMeta(): DevDriftCopyMeta {
  const cfg = useFireUXConfig()
  const configDir = `packages/ecosystem/fireux-${cfg.ecosystem}/src/config/firebase`

  return {
    ecosystem: cfg.ecosystem,
    migration: {
      script: 'scripts/migrate.mjs',
      configDir,
      ecosystemConfig: `${configDir}/ecosystem.config.ts`,
      serviceAccount: `${configDir}/service-account.json`,
    },
  }
}
