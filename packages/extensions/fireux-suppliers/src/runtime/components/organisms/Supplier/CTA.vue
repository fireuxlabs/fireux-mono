<template>
  <ConsoleEntityCTA
    title="Supplier console"
    console-to="/console/supplier"
    demo-label="Demo Suppliers"
    learn-more-to="/suppliers/learn-more"
  >
    <template #demoNote>
      <li>Uses bundled supplier demo scenarios only.</li>
    </template>

    <template #demo>
      <div v-if="scenarioCards.length" class="space-y-2">
        <SupplierCardsPill
          v-for="item in scenarioCards"
          :key="item.id"
          v-bind="item"
          :link="false"
          :action="true"
          :show-badges="false"
          class="cursor-pointer"
          @action="openScenario(item.id)"
        />
      </div>
      <p v-else class="text-sm text-dimmed">
        No demo suppliers.
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
import { useRouter } from '#imports'
import { computed } from 'vue'
import { getDemoSupplierScenarioList } from '../../../composables/fireux/app/supplier-console/demo-scenarios'
import { useSupplierSelection } from '../../../composables/fireux/app/supplier-console/useSupplierSelection'

const router = useRouter()
const { setRuntimeSupplier } = useSupplierSelection()

const scenarioCards = computed(() =>
  getDemoSupplierScenarioList().map((entry) => ({
    id: String(entry.id || '').trim(),
    title: String(entry.name || '').trim(),
    subtitle: String(entry.label || '').trim(),
    avatarUrl: String(entry.image_url || '').trim(),
    badges: [],
  }))
)

const openScenario = async (supplierId: string) => {
  const resolvedId = String(supplierId || '').trim()
  if (!resolvedId) return

  setRuntimeSupplier({ supplierId: resolvedId, mode: 'demo' })
  await router.push('/console/supplier')
}
</script>
