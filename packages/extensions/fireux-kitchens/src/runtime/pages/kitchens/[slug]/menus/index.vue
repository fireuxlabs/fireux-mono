<template>
  <main class="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
    <UPageHeader
      class="pageheader"
      :title="kitchenName"
      description="Published menus from this kitchen."
    />

    <div class="space-y-3">
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading menus...</p>
      </UPageCard>

      <p
        v-if="!pending && !kitchen"
        class="text-sm text-dimmed"
      >
        Kitchen unavailable.
      </p>

      <template v-if="!pending && kitchen && menus.length">
        <UPageCard
          v-for="menu in menus"
          :key="menu.id"
          variant="subtle"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0 space-y-1">
              <h2 class="text-lg font-semibold text-highlighted">
                {{ menu.name }}
              </h2>
              <p v-if="menu.description" class="text-sm text-dimmed">
                {{ menu.description }}
              </p>
            </div>

            <UButton
              :to="menuLink(menu.id)"
              icon="i-lucide-arrow-right"
              trailing
            >
              Open
            </UButton>
          </div>
        </UPageCard>
      </template>

      <p
        v-if="!pending && kitchen && !menus.length"
        class="text-sm text-dimmed"
      >
        No published menus.
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenu } from '../../../../composables/fireux/kitchen/menu/useKitchenMenu'

const {
  kitchen,
  menus,
  pending,
  menuLink,
} = useKitchenMenu()
const kitchenName = computed(
  () => String(kitchen.value?.display_name || kitchen.value?.name || 'Kitchen menus')
)
</script>
