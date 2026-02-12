<template>
  <UDashboardPanel id="dashboard-kitchen-supplier-detail">
    <template #header>
      <LayoutsDashboardNavbar :title="pageTitle" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-base font-semibold">{{ supplierName }}</h2>
                <p class="text-xs text-dimmed">
                  Supplier id:
                  <code>{{ supplierId }}</code>
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <UChip
                  v-if="supplierCategory"
                  color="neutral"
                  variant="soft"
                  size="xs"
                >
                  {{ supplierCategory }}
                </UChip>
                <UChip color="primary" variant="soft" size="xs">
                  {{ assignedCount }} assigned
                </UChip>
              </div>
            </div>
          </template>

          <p class="text-sm text-dimmed">
            Manage which kitchen ingredients are linked to this supplier relationship.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="text-sm font-semibold">Ingredient assignments</div>
              <UInput
                v-model="query"
                size="xs"
                placeholder="Search ingredients..."
                class="w-full sm:w-72"
              />
            </div>
          </template>

          <div v-if="filteredIngredients.length" class="space-y-2">
            <div
              v-for="ingredient in filteredIngredients"
              :key="ingredient.id"
              class="rounded-md border border-default p-3"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">{{ ingredient.name || ingredient.id }}</p>
                  <p class="truncate text-xs text-dimmed">
                    {{ ingredient.category || 'Uncategorized' }} · {{ ingredient.unit || 'unit' }}
                  </p>
                  <p class="truncate text-xs text-dimmed">
                    Current supplier:
                    <code>{{ ingredient.supplier_id || 'none' }}</code>
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <UChip
                    :color="isAssignedToCurrentSupplier(ingredient) ? 'success' : 'neutral'"
                    variant="soft"
                    size="xs"
                  >
                    {{ isAssignedToCurrentSupplier(ingredient) ? 'Linked' : 'Unlinked' }}
                  </UChip>

                  <UButton
                    v-if="isAssignedToCurrentSupplier(ingredient)"
                    size="xs"
                    color="warning"
                    variant="soft"
                    :loading="savingIngredientId === ingredient.id"
                    @click="unlinkIngredient(ingredient)"
                  >
                    Unlink
                  </UButton>
                  <UButton
                    v-else
                    size="xs"
                    color="primary"
                    variant="soft"
                    :loading="savingIngredientId === ingredient.id"
                    @click="linkIngredient(ingredient)"
                  >
                    {{ ingredient.supplier_id ? 'Reassign' : 'Assign' }}
                  </UButton>
                </div>
              </div>
            </div>
          </div>

          <p v-else class="text-sm text-dimmed">
            {{ query ? 'No ingredients match your search.' : 'No ingredients found.' }}
          </p>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, ref, watch } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../../dummy/scenario'
import {
  useRuntimeKitchen,
  useRuntimeKitchenSelection,
} from '../../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
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
const toast = useToastify()
const runtimeKitchen = useRuntimeKitchen()
const { runtimeKitchenMode } = useRuntimeKitchenSelection()
const { firestoreFetchCollection } = useFirestoreRead()
const { updateDocument } = useFirestoreUpdate()

const supplierId = computed(() => {
  const raw = route.params?.id
  return Array.isArray(raw) ? String(raw[0] || '').trim() : String(raw || '').trim()
})

const runtimeKitchenId = computed(() => String(runtimeKitchen.value?.id || '').trim())
const runtimeKitchenCollectionPath = computed(() =>
  runtimeKitchenMode.value === 'live' ? 'kitchens' : 'test-kitchens'
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

const supplierName = computed(() => String(supplier.value?.name || supplierId.value || '').trim())
const supplierCategory = computed(() => String(supplier.value?.category || '').trim())
const pageTitle = computed(() => `${supplierName.value || 'Supplier'} · Kitchen Supplier`)

const { ingredients: firestoreKitchenIngredients } = useKitchenIngredientFetch(runtimeKitchenId, {
  kitchenCollectionPath: runtimeKitchenCollectionPath,
})
const dummyKitchenIngredients = ref<KitchenIngredientResolved[]>(
  [...dummyKitchenScenario.kitchenIngredients]
)

const kitchenIngredients = computed<KitchenIngredientResolved[]>(() =>
  runtimeKitchenMode.value === 'dummy'
    ? [...dummyKitchenIngredients.value]
    : [...(firestoreKitchenIngredients.value ?? [])]
)

const query = ref('')
const filteredIngredients = computed(() => {
  const q = String(query.value || '').trim().toLowerCase()
  if (!q) return kitchenIngredients.value

  return kitchenIngredients.value.filter((ingredient) =>
    [
      ingredient.id,
      ingredient.name,
      ingredient.category,
      ingredient.unit,
      ingredient.supplier_id,
      ingredient.supplier_name,
    ]
      .map((value) => String(value || '').toLowerCase())
      .join(' ')
      .includes(q)
  )
})

const isAssignedToCurrentSupplier = (ingredient: KitchenIngredientResolved) =>
  String(ingredient.supplier_id || '').trim() === supplierId.value

const assignedCount = computed(
  () =>
    kitchenIngredients.value.filter((ingredient) => isAssignedToCurrentSupplier(ingredient)).length
)

const savingIngredientId = ref('')

const updateIngredientSupplier = async (
  ingredient: KitchenIngredientResolved,
  nextSupplierId: string,
  nextSupplierName: string
) => {
  if (savingIngredientId.value) return

  const ingredientDocId = String(ingredient.id || ingredient.ingredient_id || '').trim()
  if (!ingredientDocId) {
    toast.error('Ingredient id missing')
    return
  }

  savingIngredientId.value = ingredientDocId
  try {
    if (runtimeKitchenMode.value === 'dummy') {
      dummyKitchenIngredients.value = kitchenIngredients.value.map((entry) => {
        const id = String(entry.id || entry.ingredient_id || '').trim()
        if (id !== ingredientDocId) return entry
        return {
          ...entry,
          supplier_id: nextSupplierId,
          supplier_name: nextSupplierName,
        }
      })
      return
    }

    const kitchenId = runtimeKitchenId.value
    if (!kitchenId) throw new Error('Kitchen id missing')

    const collectionPath = `${runtimeKitchenCollectionPath.value}/${kitchenId}/ingredients`
    await updateDocument<KitchenIngredientResolved>(collectionPath, ingredientDocId, {
      supplier_id: nextSupplierId,
      supplier_name: nextSupplierName,
    })
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to update ingredient supplier'))
  } finally {
    savingIngredientId.value = ''
  }
}

const linkIngredient = async (ingredient: KitchenIngredientResolved) => {
  const nextSupplierId = supplierId.value
  if (!nextSupplierId) {
    toast.error('Supplier id missing')
    return
  }

  const nextSupplierName = supplierName.value || nextSupplierId
  await updateIngredientSupplier(ingredient, nextSupplierId, nextSupplierName)
  toast.success('Ingredient linked to supplier')
}

const unlinkIngredient = async (ingredient: KitchenIngredientResolved) => {
  await updateIngredientSupplier(ingredient, '', '')
  toast.success('Ingredient unlinked from supplier')
}
</script>
