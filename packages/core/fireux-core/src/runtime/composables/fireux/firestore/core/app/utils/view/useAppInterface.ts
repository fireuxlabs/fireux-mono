// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts

import type { Ref } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'

export namespace AppInterface {
  export type Interface = {
    id: string
    to: string
    avatar: string
    title: string
    subtitle: string
    badges: string[]
    line1: string
    line2: string
    line3: string
  }
}

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolveApp = (target?: App): App => {
    const app = target ?? appRef?.value
    if (!app) {
      throw new Error('[useAppInterface] App is required')
    }
    return app
  }

  const card = (target?: App): AppInterface.Interface => {
    const app = resolveApp(target)

    return {
      id: app.id,
      to: `/apps/${app.id}`,
      avatar: app.avatar_url,
      title: app.app_name,
      subtitle: app.ecosystem,
      badges: [],
      line1: app.description,
      line2: '',
      line3: '',
    }
  }

  return { card }
}
