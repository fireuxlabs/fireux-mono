import type { Ref } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'
import type { CardPayload } from '../../../../../../../types/card-payload'

export namespace AppCard {
  /** Single payload powering all views (Pill/Cell/Preview/Profile). */
  export type Card = CardPayload
}

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolveApp = (target?: App | null) => target ?? appRef?.value ?? null

  const toPath = (id: string) => (id ? `/apps/${id}` : '')

  const card = (target?: App | null): AppCard.Card => {
    const app = resolveApp(target)
    const id = (app?.id ?? '').trim()
    const href = toPath(id)
    const image = (app?.avatar_url ?? '').trim()

    return {
      title: (app?.app_name ?? '').trim(),
      subtitle: (app?.ecosystem ?? '').trim(),
      image,
      href,
      badges: [],
    }
  }

  return { card }
}
