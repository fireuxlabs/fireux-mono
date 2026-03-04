<template>
  <UPageCTA title="Kitchen console" orientation="horizontal">
    <template #links>
      <div class="grid gap-3 sm:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-semibold">My Kitchens</p>
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-chef-hat"
            @click="goToKitchen('live')"
          >
            Open my kitchen
          </UButton>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Test Kitchens</p>
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-flask-conical"
            @click="goToKitchen('test')"
          >
            Open test kitchen
          </UButton>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Read-only Kitchens</p>
          <div v-if="readOnlyPills.length" class="space-y-2">
            <KitchenCardsPill
              v-for="item in readOnlyPills"
              :key="item.id"
              v-bind="item"
              :link="false"
              :action="true"
              :show-badges="false"
              class="cursor-pointer"
              @action="goToKitchen('read-only', item.id)"
            />
          </div>
          <p v-else class="text-sm text-dimmed">
            No read-only kitchens.
          </p>
        </section>
      </div>
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
  </UPageCTA>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { computed } from 'vue'
import { getReadOnlyKitchenScenarioList } from '../../../composables/fireux/app/kitchen-runtime/read-only-scenarios'
import type { RuntimeKitchenMode } from '../../../composables/fireux/app/kitchen-runtime/shared'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'
import KitchenCardsPill from './Cards/Pill.vue'

const readOnlyScenarios = computed(() =>
  getReadOnlyKitchenScenarioList()
    .map((entry) => ({
      id: String(entry.id || '').trim(),
      name: String(entry.name || '').trim(),
      subtitle: String(entry.address_label || '').trim(),
      imageUrl: String(entry.image_url || '').trim(),
    }))
    .filter((entry) => Boolean(entry.id))
)

const readOnlyPills = computed(() =>
  readOnlyScenarios.value.map((entry) => ({
    id: entry.id,
    to: '',
    title: entry.name,
    subtitle: entry.subtitle,
    imageUrl: entry.imageUrl,
    badges: ['Read-only'],
  }))
)

const router = useRouter()
const { runtimeKitchenId, setRuntimeKitchen } = useRuntimeKitchenSelection()

const goToKitchen = async (mode: RuntimeKitchenMode, kitchenId?: string) => {
  const fallback = String(runtimeKitchenId.value || '').trim()
  const resolvedId = String(kitchenId || fallback).trim()
  setRuntimeKitchen({ mode, kitchenId: resolvedId })
  await router.push('/console/kitchen')
}

</script>
