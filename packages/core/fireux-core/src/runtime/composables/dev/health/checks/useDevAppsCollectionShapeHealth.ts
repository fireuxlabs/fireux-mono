import { computed } from 'vue'
import { useAppCollection } from '../../../fireux/firestore/core/app/fetch/useAppCollection'
import { useDevCollectionShapeHealth } from './useDevCollectionShapeHealth'
import { APP_MODEL_KEYS, APP_MODEL_REQUIRED_KEYS } from '../../../../models/core/app.model'

export function useDevAppsCollectionShapeHealth() {
  const { apps } = useAppCollection()

  const items = computed(() => apps.value ?? [])

  return useDevCollectionShapeHealth({
    id: 'apps-collection-shape',
    label: 'Apps · Collection shape',
    description:
      'Flags missing required fields and unexpected legacy keys on /apps documents.',
    scope: 'apps',
    items,
    requiredKeys: APP_MODEL_REQUIRED_KEYS as unknown as string[],
    allowedKeys: APP_MODEL_KEYS as unknown as string[],
    getId: (app: any) => app?.id ?? '(missing id)',
  })
}
