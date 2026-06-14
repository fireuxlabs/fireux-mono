<template>
  <main class="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
    <UPageHeader
      class="pageheader"
      :title="kitchenName"
      description="Published menus."
    />

    <div class="space-y-3">
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading menus...</p>
      </UPageCard>

      <UAlert
        v-if="!pending && !kitchen"
        color="neutral"
        variant="soft"
        title="Menu unavailable"
        description="This app does not have a single public kitchen menu surface."
      />

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

      <UAlert
        v-if="!pending && kitchen && !menus.length"
        color="neutral"
        variant="soft"
        title="No published menus"
        description="This kitchen has not published a menu yet."
      />
    </div>

    <DevJson
      title="Kitchen public single menu index debug"
      context="Kitchen menu index · /menus"
      :data="debug"
      :default-open="false"
    />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenPublicSingleMenuScope } from '../../composables/fireux/public/kitchen/menu/useKitchenPublicSingleMenuScope'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicSingleMenusIndexPage',
})

const {
  kitchen,
  menus,
  pending,
  menuLink,
  debug,
} = useKitchenPublicSingleMenuScope()
const kitchenName = computed(
  () => String(kitchen.value?.display_name || kitchen.value?.name || 'Menus')
)
</script>
