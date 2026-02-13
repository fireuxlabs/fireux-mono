<template>
  <UDashboardPanel id="dashboard-kitchen-suppliers">
    <template #header>
      <LayoutsDashboardNavbar title="Suppliers" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Supplier board</h2>
                <KitchenCardsPill v-if="kitchenPill" v-bind="kitchenPill" />
              </div>
              <p class="text-xs text-dimmed">
                <template v-if="runtimeKitchenMode === 'read-only'">
                  Read-only mode: supplier edits are disabled.
                </template>
                <template v-else-if="runtimeKitchenMode === 'test'">
                  Test mode: create simple kitchen suppliers with id + category.
                </template>
                <template v-else>
                  Runtime mode: browse global suppliers.
                </template>
              </p>
            </div>
          </template>
        </UCard>

        <section v-if="runtimeKitchenMode === 'test'" class="space-y-2">
          <UCard>
            <template #header>
              <div class="space-y-1">
                <div class="text-sm font-semibold">Add supplier</div>
                <p class="text-xs text-dimmed">
                  Save to
                  <code>{{ runtimeKitchenCollectionPath }}/{{ runtimeKitchenId }}/suppliers/{supplier-id}</code>.
                </p>
              </div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2">
              <UFormField label="ID" required>
                <UInput
                  v-model="draft.id"
                  placeholder="e.g. butcher"
                  icon="i-lucide-fingerprint"
                />
              </UFormField>

              <UFormField label="Category">
                <UInput
                  v-model="draft.category"
                  placeholder="e.g. Meat"
                  icon="i-lucide-tag"
                />
              </UFormField>
            </div>

            <div class="mt-4 flex justify-end">
              <UButton
                :loading="isCreating"
                icon="i-lucide-plus"
                @click="createTestSupplier"
              >
                Add supplier
              </UButton>
            </div>
          </UCard>

          <SupplierCollectionManager
            :collection="kitchenSuppliers"
            title="Kitchen suppliers"
            description="Simple suppliers for kitchen linking."
          />
        </section>

        <section v-else-if="runtimeKitchenMode === 'read-only'" class="space-y-2">
          <SupplierCollectionManager
            :collection="kitchenSuppliers"
            title="Kitchen suppliers"
            description="Read-only suppliers from local scenario."
          />
        </section>

        <section v-else class="space-y-2">
          <SupplierCollectionManager
            :collection="globalSuppliers"
            title="Global suppliers"
            description="Supplier profiles available globally."
          />
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, ref, watch } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import KitchenCardsPill from '../../../components/organisms/Kitchen/Cards/Pill.vue'
import SupplierCollectionManager from '../../../components/organisms/Supplier/Collection/Manager.vue'
import {
  useRuntimeKitchen,
  useRuntimeKitchenSelection,
} from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-store',
    order: 11,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

type GlobalSupplier = {
  id?: string
  name?: string
  category?: string
  supplier_headline?: string
  supplier_organization_name?: string
  supplier_product_categories?: string[]
}

type KitchenSupplier = {
  id: string
  supplier_id: string
  kitchen_id: string
  name: string
  category: string
}

const runtimeKitchen = useRuntimeKitchen()
const { runtimeKitchenMode } = useRuntimeKitchenSelection()
const { pill: kitchenPillBuilder } = useKitchenInterface()
const kitchenPill = computed(() => kitchenPillBuilder(runtimeKitchen.value))

const runtimeKitchenId = computed(() => String(runtimeKitchen.value?.id || '').trim())
const runtimeKitchenCollectionPath = computed(() =>
  runtimeKitchenMode.value === 'live' ? 'kitchens' : 'test-kitchens'
)

const toast = useToastify()
const { setDocument } = useFirestoreCreate()
const { firestoreFetchCollection } = useFirestoreRead()

const globalSuppliersRef = firestoreFetchCollection<GlobalSupplier>('suppliers')
const globalSuppliers = computed(() => [...(globalSuppliersRef.value ?? [])])

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

    onCleanup(() => {
      stop()
    })
  },
  { immediate: true }
)

const kitchenSuppliers = computed<KitchenSupplier[]>(() =>
  runtimeKitchenMode.value === 'read-only'
    ? [...dummyKitchenSuppliers.value]
    : [...kitchenSuppliersRemote.value]
)

const draft = ref({
  id: '',
  category: '',
})
const isCreating = ref(false)

const toKebab = (value: string) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const createTestSupplier = async () => {
  if (isCreating.value) return

  const kitchenId = runtimeKitchenId.value
  if (!kitchenId) {
    toast.error('Kitchen id missing')
    return
  }

  const idInput = String(draft.value.id || '').trim()
  const category = String(draft.value.category || '').trim()

  if (!idInput) {
    toast.error('Supplier id is required')
    return
  }

  const supplierId = toKebab(idInput)
  if (!supplierId) {
    toast.error('Unable to resolve supplier id')
    return
  }

  const exists = kitchenSuppliers.value.some((supplier) => String(supplier.id || '') === supplierId)
  if (exists) {
    toast.info('Supplier already exists in this test kitchen')
    return
  }

  isCreating.value = true
  try {
    if (runtimeKitchenMode.value === 'read-only') {
      toast.info('Read-only kitchen: edit dummy/scenario.ts')
      return
    }

    const collectionPath = `${runtimeKitchenCollectionPath.value}/${kitchenId}/suppliers`
    const payload: KitchenSupplier = {
      id: supplierId,
      supplier_id: supplierId,
      kitchen_id: kitchenId,
      name: supplierId,
      category,
    }

    await setDocument<KitchenSupplier>(collectionPath, supplierId, payload, {
      app: true,
      creator: true,
    })

    draft.value = {
      id: '',
      category: '',
    }
    toast.success('Test supplier created')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to create test supplier'))
  } finally {
    isCreating.value = false
  }
}
</script>
