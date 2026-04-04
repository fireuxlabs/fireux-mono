import { useState } from '#imports'
import { toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

export type ConsoleHeaderPillState = {
  component: string
  props: Record<string, unknown>
}

type UseConsoleHeaderPillOptions = {
  link?: boolean
  showBadges?: boolean
}

export function useConsoleHeaderPill(
  key: string,
  component: string,
  pill: MaybeRefOrGetter<Record<string, unknown> | null | undefined>,
  options: UseConsoleHeaderPillOptions = {}
) {
  const state = useState<ConsoleHeaderPillState | null>(key, () => null)

  watchEffect(() => {
    const value = toValue(pill)

    state.value = value
      ? {
          component,
          props: {
            ...value,
            link: options.link ?? false,
            showBadges: options.showBadges ?? false,
          },
        }
      : null
  })

  return state
}
