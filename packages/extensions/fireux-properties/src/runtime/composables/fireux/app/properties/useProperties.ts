import { useHead, useRoute } from '#imports'
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import type { Property } from '../../../../models/property.model'
import {
  createTestPropertySimulation,
  getDemoPropertySimulations,
  getLocalLiveProperties,
} from '../property-console/demo-scenarios'

export type PropertyCollectionSource = 'live' | 'demo' | 'test'

const normalise = (value: unknown) => String(value ?? '').trim()

export function useProperties() {
  const pageTitle = 'Properties'
  const pageDescription = 'Choose a property or stay companion surface.'
  const route = useRoute()
  const { appName } = useFireUXConfig()
  const { notesVisible } = useDevUi()
  const { uid } = useAuth()
  const { currentUser, avatarSrc } = useUser()

  const resolveSourceMode = (path: string): PropertyCollectionSource =>
    path.endsWith('.demo')
      ? 'demo'
      : path.endsWith('.test')
        ? 'test'
        : 'live'

  const routePath = computed(() => route.fullPath || route.path)
  const sourceMode = ref<PropertyCollectionSource>(
    resolveSourceMode(routePath.value)
  )
  const showDevNotes = computed(() => import.meta.dev && notesVisible.value)

  const liveProperties = computed<Property[]>(() => getLocalLiveProperties(normalise(uid.value)))
  const demoProperties = computed<Property[]>(() => getDemoPropertySimulations())
  const testProperty = computed<Property | null>(() =>
    createTestPropertySimulation(
      normalise(uid.value),
      normalise(currentUser.value?.display_name),
      normalise(avatarSrc.value)
    )
  )

  const properties = computed<Property[]>(() => {
    if (sourceMode.value === 'demo') return demoProperties.value
    if (sourceMode.value === 'test') {
      return testProperty.value ? [testProperty.value] : []
    }
    return liveProperties.value
  })

  const pending = computed(() => false)
  const devSourceLabel = computed(() => {
    if (sourceMode.value === 'demo') return 'local demo property simulations'
    if (sourceMode.value === 'test') return 'signed-in test property simulation'
    return 'local live property scaffold'
  })
  const devPropertyCount = computed(() => properties.value.length)

  watch(routePath, (path) => {
    sourceMode.value = resolveSourceMode(path)
  })

  const setSourceMode = (value: PropertyCollectionSource) => {
    sourceMode.value = value
  }

  useHead({ title: `${appName} | ${pageTitle}` })

  return {
    pageTitle,
    pageDescription,
    sourceMode,
    properties,
    pending,
    showDevNotes,
    routePath,
    devSourceLabel,
    devPropertyCount,
    setSourceMode,
  }
}
