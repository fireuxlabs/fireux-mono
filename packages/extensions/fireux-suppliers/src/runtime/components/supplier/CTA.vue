<template>
  <ConsoleEntityCTA
    title="Supplier console"
    my-label="My Supplier"
    test-label=""
    read-only-label="Read-only Suppliers"
    learn-more-to="/suppliers/learn-more"
    :show-test="false"
  >
    <template #my>
      <div class="space-y-2">
        <SupplierCardsPill
          v-if="liveSupplierPill"
          v-bind="liveSupplierPill"
          :link="false"
          :action="true"
          :show-badges="false"
          class="cursor-pointer"
          @action="goToSupplier('live', liveSupplierPill.id)"
        />

        <UButton
          v-else
          block
          variant="subtle"
          color="primary"
          icon="i-lucide-plus"
          @click="createSupplier"
        >
          Create supplier
        </UButton>
      </div>
    </template>

    <template #readOnly>
      <div v-if="readOnlyPills.length" class="space-y-2">
        <SupplierCardsPill
          v-for="item in readOnlyPills"
          :key="item.id"
          v-bind="item"
          :link="false"
          :action="true"
          :show-badges="false"
          class="cursor-pointer"
          @action="goToSupplier('read-only', item.id)"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No read-only suppliers.
      </p>
    </template>

    <template #default>
      <img
        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="Supplier operations"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      />
    </template>
  </ConsoleEntityCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import ConsoleEntityCTA from 'fireux-core/runtime/components/entities/console/ConsoleEntityCTA.vue'
import { getReadOnlySupplierScenarioList } from '../../composables/fireux/app/supplier-console/read-only-scenarios'
import type { RuntimeSupplierMode } from '../../composables/fireux/app/supplier-console/state'
import { useRuntimeSupplierSelection } from '../../composables/fireux/app/supplier-console/state'
import { useSupplierInterface } from '../../composables/supplier/useSupplierInterface'
import { useSupplierRecord } from '../../composables/supplier/useSupplierRecord'
import SupplierCardsPill from './Cards/Pill.vue'

const router = useRouter()
const { uid } = useAuth()
const { setRuntimeSupplier } = useRuntimeSupplierSelection()
const supplierRecord = useSupplierRecord(computed(() => String(uid.value || '').trim()))
const { pill: supplierPill } = useSupplierInterface(supplierRecord)

const liveSupplierPill = computed(() => supplierPill())

const readOnlyPills = computed(() =>
  getReadOnlySupplierScenarioList()
    .map((entry) => ({
      id: String(entry.id || '').trim(),
      to: '',
      title: String(entry.name || '').trim(),
      subtitle: String(entry.label || '').trim(),
      imageUrl: String(entry.image_url || '').trim(),
    }))
    .filter((entry) => Boolean(entry.id))
)

const goToSupplier = async (mode: RuntimeSupplierMode, supplierId?: string) => {
  const resolvedId = String(supplierId || uid.value || '').trim()
  setRuntimeSupplier({ supplierId: resolvedId, mode })
  await router.push('/console/supplier/overview')
}

const createSupplier = async () => {
  await router.push('/console/supplier/create')
}
</script>
