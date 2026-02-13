<template>
  <UDashboardPanel id="dashboard-kitchen-supplier-detail">
    <template #header>
      <LayoutsDashboardNavbar :title="pageTitle" />
    </template>

    <template #body>
      <div class="space-y-6">
        <IngredientCollectionManager
          :collection="linkedIngredients"
          title="Linked ingredients"
          :description="linkedIngredientsDescription"
        />

        <IngredientCollectionManager
          :collection="otherIngredientsCollection"
          :title="otherIngredientsTitle"
          :description="otherIngredientsDescription"
        >
          <template #controls>
            <UButton
              size="xs"
              :variant="otherIngredientsMode === 'all' ? 'solid' : 'soft'"
              @click="setOtherIngredientsMode('all')"
            >
              All ingredients
            </UButton>
            <UButton
              size="xs"
              :variant="otherIngredientsMode === 'unlinked' ? 'solid' : 'soft'"
              @click="setOtherIngredientsMode('unlinked')"
            >
              Unlinked ingredients
            </UButton>
          </template>
        </IngredientCollectionManager>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, ref, watch } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../../dummy/scenario'
import IngredientCollectionManager from '../../../../components/organisms/Ingredient/Collection/Manager.vue'
import {
  useRuntimeKitchen,
  useRuntimeKitchenSelection,
} from '../../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import { useIngredientFetch } from '../../../../composables/fireux/firestore/ingredient/fetch/useIngredientFetch'
import { useKitchenIngredientFetch } from '../../../../composables/fireux/firestore/ingredient/fetch/useKitchenIngredientFetch'
import type { KitchenIngredientResolved } from '../../../../models/ingredient.model'

definePageMeta({
  layout: 'kitchen-dashboard',
  requiresAuth: true,
})

type KitchenSupplier = {
  id: string
  supplier_id: string
  kitchen_id: string
  name: string
  category: string
}

const route = useRoute()
const runtimeKitchen = useRuntimeKitchen()
const { runtimeKitchenMode } = useRuntimeKitchenSelection()
const { firestoreFetchCollection } = useFirestoreRead()

const supplierId = computed(() => {
  const raw = route.params?.id
  return Array.isArray(raw) ? String(raw[0] || '').trim() : String(raw || '').trim()
})

const runtimeKitchenId = computed(() => String(runtimeKitchen.value?.id || '').trim())
const runtimeKitchenCollectionPath = computed(() =>
  runtimeKitchenMode.value === 'live' ? 'kitchens' : 'test-kitchens'
)
const firestoreKitchenId = computed(() =>
  runtimeKitchenMode.value === 'dummy' ? '' : runtimeKitchenId.value
)

const kitchenSuppliersPath = computed(() => {
  const kitchenId = runtimeKitchenId.value
  if (!kitchenId) return ''
  return `${runtimeKitchenCollectionPath.value}/${kitchenId}/suppliers`
})

const kitchenSuppliersRemote = ref<KitchenSupplier[]>([])
const dummyKitchenSuppliers = ref<KitchenSupplier[]>(
  [...(dummyKitchenScenario.procurementStack?.suppliers ?? [])] as KitchenSupplier[]
)

watch(
  kitchenSuppliersPath,
  (nextPath, _prevPath, onCleanup) => {
    if (!nextPath) {
      kitchenSuppliersRemote.value = []
      return
    }

    const source = firestoreFetchCollection<KitchenSupplier>(nextPath)
    const stop = watch(
      source,
      (rows) => {
        kitchenSuppliersRemote.value = [...(rows ?? [])]
      },
      { immediate: true }
    )

    onCleanup(() => stop())
  },
  { immediate: true }
)

const kitchenSuppliers = computed<KitchenSupplier[]>(() =>
  runtimeKitchenMode.value === 'dummy'
    ? [...dummyKitchenSuppliers.value]
    : [...kitchenSuppliersRemote.value]
)

const supplier = computed(() => {
  const id = supplierId.value
  if (!id) return null
  return (
    kitchenSuppliers.value.find((entry) => String(entry.id || '').trim() === id) ?? {
      id,
      supplier_id: id,
      kitchen_id: runtimeKitchenId.value,
      name: id,
      category: '',
    }
  )
})

const pageTitle = computed(() => `${supplierName.value || 'Supplier'} · Kitchen Supplier`)
const supplierName = computed(() => String(supplier.value?.name || supplierId.value || '').trim())
const linkedIngredientsDescription = computed(() => {
  const name = supplierName.value || supplierId.value || 'this kitchen supplier'
  return `Ingredients using ${name}.`
})

const { ingredients: firestoreKitchenIngredients } = useKitchenIngredientFetch(firestoreKitchenId, {
  kitchenCollectionPath: runtimeKitchenCollectionPath,
})
const { ingredients: firestoreGlobalIngredients } = useIngredientFetch()

const globalIngredients = computed(() =>
  runtimeKitchenMode.value === 'dummy'
    ? [...dummyKitchenScenario.globalIngredients]
    : [...(firestoreGlobalIngredients.value ?? [])]
)

const globalIngredientById = computed(() => {
  const map = new Map<string, any>()
  for (const ingredient of globalIngredients.value) {
    const id = String((ingredient as any)?.id || '').trim()
    if (!id) continue
    map.set(id, ingredient)
  }
  return map
})

const kitchenIngredients = computed<KitchenIngredientResolved[]>(() =>
  runtimeKitchenMode.value === 'dummy'
    ? dummyKitchenScenario.kitchenIngredients
      .map((entry: any) => {
        const ingredientId = String(entry.ingredient_id || entry.id || '').trim()
        const global = globalIngredientById.value.get(ingredientId)
        return {
          ...(global ?? {}),
          ...entry,
          id: String(entry.id || ingredientId).trim() || ingredientId,
          ingredient_id: ingredientId,
        } as KitchenIngredientResolved
      })
    : [...(firestoreKitchenIngredients.value ?? [])]
)

const normalizedKitchenIngredients = computed<KitchenIngredientResolved[]>(() =>
  kitchenIngredients.value
    .map((ingredient) => {
      const id = String((ingredient as any)?.id || (ingredient as any)?.ingredient_id || '').trim()
      if (!id) return null
      return {
        ...ingredient,
        id,
        ingredient_id: String((ingredient as any)?.ingredient_id || id).trim(),
      } as KitchenIngredientResolved
    })
    .filter((ingredient): ingredient is KitchenIngredientResolved => Boolean(ingredient))
)

const linkedIngredients = computed(() =>
  normalizedKitchenIngredients.value.filter(
    (ingredient) => String(ingredient.supplier_id || '').trim() === supplierId.value
  )
)

const unlinkedIngredients = computed(() =>
  normalizedKitchenIngredients.value.filter(
    (ingredient) => !String(ingredient.supplier_id || '').trim()
  )
)

const otherIngredientsMode = ref<'all' | 'unlinked'>('all')

const otherIngredientsCollection = computed(() =>
  otherIngredientsMode.value === 'all'
    ? normalizedKitchenIngredients.value
    : unlinkedIngredients.value
)

const otherIngredientsTitle = computed(() =>
  otherIngredientsMode.value === 'all'
    ? 'All ingredients'
    : 'Unlinked ingredients'
)

const otherIngredientsDescription = computed(() =>
  otherIngredientsMode.value === 'all'
    ? 'All kitchen ingredients in this runtime.'
    : 'Ingredients with no supplier linked.'
)

const setOtherIngredientsMode = (mode: 'all' | 'unlinked') => {
  otherIngredientsMode.value = mode
}
</script>
