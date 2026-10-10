import { computed } from 'vue'
import {
  collection,
  documentId,
  limit,
  or,
  query,
  where,
  type Query,
} from 'firebase/firestore'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  readRuntimeFirestoreDatabaseId,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { IngredientInterfaceItem } from '../../../../ingredient/composables/useIngredientInterface'
import { useIngredientDetail } from '../../../../ingredient/composables/useIngredientDetail'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenAccess } from '../../useKitchenAccess'
import {
  KitchenIngredientStorage,
  type KitchenIngredient,
} from '../../../utils/kitchen-ingredient'

export function useKitchenWorkspaceIngredient() {
  const workspace = useKitchenWorkspace()
  const access = useKitchenAccess()
  const session = useAppSession()
  const config = useFireUXConfig()
  const kitchenId = workspace.id
  const selectedKitchen = workspace.data
  const ingredientId = useRouteParam('ingredientId')
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const permitted = computed(
    () =>
      workspace.accountReady.value &&
      workspace.hasAccount.value &&
      workspace.outcome.value === 'ready' &&
      selectedKitchen.value?.id === kitchenId.value &&
      access.ids.value.includes(kitchenId.value)
  )
  const collectionPath = computed(() =>
    permitted.value && ingredientId.value
      ? `kitchens/${kitchenId.value}/${KitchenIngredientStorage.collection}`
      : ''
  )
  const resolveDb = useFirestoreResolver(databaseId)
  const source = useFirestoreRead({
    databaseId,
  }).firestoreQuery<KitchenIngredient>(
    computed(() => {
      // Same Kitchen/link in another account must establish a fresh live binding.
      void session.uid.value
      void session.appUser.value?.created?.at
      void config.appId
      return collectionPath.value
        ? (query(
            collection(resolveDb(), collectionPath.value),
            or(
              where(documentId(), '==', ingredientId.value),
              where('ingredient_id', '==', ingredientId.value)
            ),
            limit(2)
          ) as Query<KitchenIngredient>)
        : null
    }),
    undefined,
    collectionPath
  )
  const link = computed(() =>
    source.value?.length === 1 ? source.value[0] : null
  )
  const canonicalId = computed(() =>
    link.value ? String(link.value.ingredient_id || link.value.id).trim() : ''
  )
  const canonical = useIngredientDetail(canonicalId)
  const loadError = computed(() => {
    if (!kitchenId.value) return null
    if (workspace.outcome.value !== 'ready')
      return workspace.outcome.value === 'error'
        ? session.error.value ||
            access.error.value ||
            new Error('Kitchen could not be loaded.')
        : null
    if (!permitted.value) return null
    return (
      source.error.value ||
      ((source.value?.length ?? 0) > 1
        ? new Error('Kitchen ingredient identity is not unique.')
        : null) ||
      (canonicalId.value && canonical.outcome.value === 'error'
        ? canonical.error.value
        : null)
    )
  })
  const outcome = computed(() => {
    if (!kitchenId.value) return 'idle'
    if (workspace.outcome.value !== 'ready') return workspace.outcome.value
    if (!permitted.value) return 'pending'
    if (loadError.value) return 'error'
    if (source.pending.value || (canonicalId.value && canonical.pending.value))
      return 'pending'
    return link.value ? 'ready' : 'missing'
  })
  const pending = computed(() => outcome.value === 'pending')
  const ingredient = computed<IngredientInterfaceItem | null>(() => {
    if (!permitted.value || pending.value || loadError.value || !link.value)
      return null
    const root =
      canonical.outcome.value === 'ready' ? canonical.ingredient.value : null
    return {
      ...(root || {
        id: canonicalId.value,
        name: 'Missing ingredient',
        slug: '',
        image_url: '',
      }),
      ingredient_id: canonicalId.value,
      kitchen_ingredient: link.value,
      missing_root_ingredient: !root,
    }
  })
  const canWrite = computed(
    () =>
      permitted.value &&
      Boolean(ingredient.value) &&
      !pending.value &&
      !loadError.value
  )
  const readOnly = computed(() => !canWrite.value)
  return {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    readOnly,
    canWrite,
    pending,
    outcome,
    loadError,
    ingredientId,
    ingredient,
    debug: computed(() => ({
      kitchenId: kitchenId.value,
      ingredientId: ingredientId.value,
      canonicalId: canonicalId.value,
      collectionPath: collectionPath.value,
      pending: pending.value,
      loadError: Boolean(loadError.value),
      canWrite: canWrite.value,
    })),
  }
}
