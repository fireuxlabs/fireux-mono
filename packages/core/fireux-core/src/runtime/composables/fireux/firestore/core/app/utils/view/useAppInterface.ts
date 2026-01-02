// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts

import type { Ref } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'

export namespace AppCard {
  export type Card = {
    id: string
    to: string
    avatar: string
    title: string
    subtitle: string
    badges: string[]
    description: string
    role: string
    shortName: string
  }
}

// Backwards-compat alias (older code imported AppInterface.Interface)
export namespace AppInterface {
  export type Interface = AppCard.Card
}

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolveApp = (target?: App): App => {
    const app = target ?? appRef?.value
    if (!app) {
      throw new Error('[useAppInterface] App is required')
    }
    return app
  }

  const card = (target?: App): AppCard.Card => {
    const app = resolveApp(target)

    return {
      id: app.id,
      to: `/apps/${app.id}`,
      avatar: app.avatar_url,
      title: app.app_name,
      subtitle: app.ecosystem,
      badges: [],
      description: app.description,
      role: app.role,
      shortName: app.app_short_name,
    }
  }

  return { card }
}
