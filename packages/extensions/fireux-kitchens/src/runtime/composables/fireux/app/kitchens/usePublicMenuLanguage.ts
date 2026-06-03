import { doc, getDoc } from 'firebase/firestore'
import { computed, ref, unref, watch, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  PUBLIC_MENU_COPY_PACK_ID,
  resolvePublicKitchenChromeLabels,
  resolvePublicKitchenChromeLanguage,
  type PublicKitchenChromeLabels,
} from './publicLanguage'

type LanguageSource = Record<string, unknown> | null

function publicMenuLocale(value: unknown): string {
  return resolvePublicKitchenChromeLanguage({ selectedLanguage: value })
}

async function readLanguage(
  resolveDb: ReturnType<typeof useFirestoreResolver>,
  path: string
): Promise<LanguageSource> {
  if (!path) return null

  const snapshot = await getDoc(doc(resolveDb(), path))
  if (!snapshot.exists()) return null

  return {
    ...snapshot.data(),
    id: snapshot.id,
  }
}

export function usePublicMenuLanguage(language: Ref<unknown>) {
  const { appId } = useFireUXConfig()
  const resolveDb = useFirestoreResolver()
  const ecosystemLanguage = ref<LanguageSource>(null)
  const appLanguage = ref<LanguageSource>(null)
  const pending = ref(false)
  const error = ref('')
  let requestId = 0

  const locale = computed(() => publicMenuLocale(unref(language)))
  const ecosystemPath = computed(
    () => `copy_packs/${PUBLIC_MENU_COPY_PACK_ID}/locales/${locale.value}`
  )
  const appPath = computed(() =>
    appId
      ? `apps/${appId}/copy_packs/${PUBLIC_MENU_COPY_PACK_ID}/locales/${locale.value}`
      : ''
  )
  const labels = computed<PublicKitchenChromeLabels>(() =>
    resolvePublicKitchenChromeLabels({
      ecosystemPack: ecosystemLanguage.value,
      tenantPack: appLanguage.value,
    })
  )

  watch(
    locale,
    async () => {
      const activeRequestId = ++requestId
      pending.value = true
      error.value = ''

      try {
        const [nextEcosystemLanguage, nextAppLanguage] = await Promise.all([
          readLanguage(resolveDb, ecosystemPath.value),
          readLanguage(resolveDb, appPath.value),
        ])

        if (activeRequestId !== requestId) return

        ecosystemLanguage.value = nextEcosystemLanguage
        appLanguage.value = nextAppLanguage
      } catch (cause) {
        if (activeRequestId !== requestId) return

        error.value = cause instanceof Error ? cause.message : String(cause)
        ecosystemLanguage.value = null
        appLanguage.value = null
      } finally {
        if (activeRequestId === requestId) pending.value = false
      }
    },
    { immediate: true }
  )

  return {
    labels,
    locale,
    pending,
    error,
    ecosystemPath,
    appPath,
  }
}
