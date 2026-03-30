import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useState } from '#imports'

type UseConsoleFamilyAccessInput = {
  entityKey: string
  singularNoun: string
  pluralNoun: string
  ownerName?: MaybeRefOrGetter<string | null | undefined>
  signedIn: MaybeRefOrGetter<boolean>
  isPremium: MaybeRefOrGetter<boolean>
  liveCount: MaybeRefOrGetter<number>
  readOnlyCount: MaybeRefOrGetter<number>
}

const toBool = (value: MaybeRefOrGetter<boolean>) => Boolean(toValue(value))
const toCount = (value: MaybeRefOrGetter<number>) =>
  Math.max(0, Number(toValue(value) || 0))
const toText = (value: MaybeRefOrGetter<string | null | undefined>) =>
  String(toValue(value) || '').trim()

const toBundleSubtitle = (count: number, singularNoun: string, pluralNoun: string) =>
  `${count} ${count === 1 ? singularNoun : pluralNoun}`

const toTitleCase = (value: string) =>
  String(value || '')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())

const toFirstWord = (value: string) => {
  const text = String(value || '').trim()
  return text ? text.split(/\s+/)[0] || '' : ''
}

const toPossessive = (value: string) =>
  /s$/i.test(value) ? `${value}'` : `${value}'s`

export function useConsoleFamilyAccess(input: UseConsoleFamilyAccessInput) {
  const premiumPreviewEnabled = useState<boolean>(
    `fireux-console-${input.entityKey}-premium-preview`,
    () => false
  )

  const signedIn = computed(() => toBool(input.signedIn))
  const isPremium = computed(() => toBool(input.isPremium))
  const liveCount = computed(() => toCount(input.liveCount))
  const readOnlyCount = computed(() => toCount(input.readOnlyCount))
  const ownerFirstName = computed(() => toFirstWord(toText(input.ownerName ?? '')))

  const showPremiumPreviewToggle = computed(
    () =>
      signedIn.value &&
      !isPremium.value &&
      readOnlyCount.value > 1
  )

  const showBundledLive = computed(
    () => signedIn.value && isPremium.value && liveCount.value > 1
  )

  const showBundledReadOnly = computed(
    () =>
      signedIn.value &&
      readOnlyCount.value > 1 &&
      (isPremium.value || premiumPreviewEnabled.value)
  )

  return {
    premiumPreviewEnabled,
    showPremiumPreviewToggle,
    showBundledLive,
    liveBundleTitle: computed(
      () =>
        ownerFirstName.value
          ? `${toPossessive(ownerFirstName.value)} ${toTitleCase(input.singularNoun)} Console`
          : `My ${toTitleCase(input.singularNoun)} Console`
    ),
    liveBundleSubtitle: computed(() =>
      toBundleSubtitle(
        liveCount.value,
        input.singularNoun,
        input.pluralNoun
      )
    ),
    showBundledReadOnly,
    readOnlyBundleTitle: computed(
      () => `Demo ${toTitleCase(input.singularNoun)} Console`
    ),
    readOnlyBundleSubtitle: computed(() =>
      toBundleSubtitle(
        readOnlyCount.value,
        input.singularNoun,
        input.pluralNoun
      )
    ),
  }
}
