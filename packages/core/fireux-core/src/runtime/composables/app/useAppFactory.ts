// ~/composables/app/useAppFactory.ts
import type { Ref } from 'vue'

import type { AppDoc, AppRole } from '../../models/core/app.model'
import { useFireUXConfig } from '../FireUXConfig'

// Only override allowed: name a sandbox via tuple
export type CreateAppInput = ['sandbox', string] | undefined

export function useAppFactory(_app?: Ref<AppDoc | null | undefined>) {
  const { ecosystem, role, appId, appName, appShortName } = useFireUXConfig()
  if (!ecosystem)
    throw new Error('AppFactory: missing ecosystem in runtime config.')

  function createApp(input?: CreateAppInput): Partial<AppDoc> {
    const r = role as AppRole

    // sandbox only from global shell (tuple form to pass the name)
    if (input) {
      if (r !== 'global')
        throw new Error('Sandbox creation is only allowed from the global app.')
      const [, sandboxName] = input
      if (!sandboxName)
        throw new Error('Sandbox requires a non-empty app name.')
      return {
        id: `sandbox-${Date.now()}`,
        ecosystem,
        app_name: sandboxName,
        role: 'sandbox',
      }
    }

    // runtime-driven (no override)
    if (r === 'global') {
      return {
        id: `${ecosystem}-app`,
        ecosystem,
        app_name: appName,
        ...(appShortName ? { app_short_name: appShortName } : {}),
        role: 'global',
      }
    }

    // tenant
    return {
      id: appId || 'tenant-app',
      ecosystem,
      app_name: appName || 'Tenant App',
      ...(appShortName ? { app_short_name: appShortName } : {}),
      role: 'tenant',
    }
  }

  // handy guard for UI (disable sandbox button if false)
  function canCreateSandbox() {
    return (role as AppRole) === 'global'
  }

  return { createApp, canCreateSandbox }
}
