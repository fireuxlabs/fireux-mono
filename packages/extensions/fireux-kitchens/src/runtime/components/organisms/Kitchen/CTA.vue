<template>
  <ConsoleEntityCTA
    title="Kitchen console"
    console-to="/console/kitchen"
    demo-label="Demo Kitchens"
    learn-more-to="/kitchens/learn-more"
  >
    <template #demoNote>
      <li>Uses bundled kitchen demo scenarios only.</li>
    </template>

    <template #demo>
      <div v-if="scenarioCards.length" class="space-y-2">
        <KitchenCardsPill
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
        No demo kitchens.
      </p>
    </template>

    <template #default>
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="Kitchen"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      />
    </template>
  </ConsoleEntityCTA>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { computed } from 'vue'
import { getDemoKitchenScenarioList } from '../../../composables/fireux/app/kitchen-console/demo-scenarios'
import { useKitchenSelection } from '../../../composables/fireux/app/kitchen-console/useKitchenSelection'

const router = useRouter()
const { setRuntimeKitchen } = useKitchenSelection()

const scenarioCards = computed(() =>
  getDemoKitchenScenarioList().map((entry) => ({
    id: String(entry.id || '').trim(),
    title: String(entry.name || '').trim(),
    subtitle: String(entry.address_label || '').trim(),
    imageUrl: String(entry.image_url || '').trim(),
    badges: [],
  }))
)

const openScenario = async (kitchenId: string) => {
  const resolvedId = String(kitchenId || '').trim()
  if (!resolvedId) return

  setRuntimeKitchen({ kitchenId: resolvedId, mode: 'demo' })
  await router.push('/console/kitchen')
}
</script>
