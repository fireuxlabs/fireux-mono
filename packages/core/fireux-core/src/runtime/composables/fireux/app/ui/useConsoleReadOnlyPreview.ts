import { computed, unref } from 'vue'
import { useState } from '#imports'

type MaybeValue<T> = T | { value: T }

type UseConsoleReadOnlyPreviewInput = {
  entityKey: string
  bundleTitle: string
  singularNoun: string
  pluralNoun: string
  signedIn: MaybeValue<boolean>
  isPremium: MaybeValue<boolean>
  itemCount: MaybeValue<number>
}

const toBool = (value: MaybeValue<boolean>) => Boolean(unref(value))
const toCount = (value: MaybeValue<number>) => Math.max(0, Number(unref(value) || 0))

export function useConsoleReadOnlyPreview(
  input: UseConsoleReadOnlyPreviewInput
) {
  const premiumPreviewEnabled = useState<boolean>(
    `fireux-console-${input.entityKey}-premium-preview`,
    () => false
  )

  const showPremiumPreviewToggle = computed(
    () =>
      toBool(input.signedIn) &&
      !toBool(input.isPremium) &&
      toCount(input.itemCount) > 0
  )

  const showBundledReadOnly = computed(
    () =>
      toBool(input.signedIn) &&
      toCount(input.itemCount) > 0 &&
      (toBool(input.isPremium) || premiumPreviewEnabled.value)
  )

  const bundledSubtitle = computed(() => {
    const count = toCount(input.itemCount)
    const noun = count === 1 ? input.singularNoun : input.pluralNoun
    return `${count} ${noun}`
  })

  return {
    premiumPreviewEnabled,
    showPremiumPreviewToggle,
    showBundledReadOnly,
    bundledTitle: computed(() => input.bundleTitle),
    bundledSubtitle,
  }
}
