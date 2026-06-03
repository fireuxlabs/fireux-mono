<template>
  <main class="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
    <UButton
      :to="`/kitchens/${encodeURIComponent(kitchenSlug)}`"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to kitchen
    </UButton>

    <UPageHeader
      class="pageheader"
      :title="kitchen?.name || 'Kitchen menus'"
      description="Published menus from this kitchen."
    />

    <UPageCard v-if="pending" variant="subtle">
      <p class="text-sm text-dimmed">Loading menus...</p>
    </UPageCard>

    <UAlert
      v-else-if="!kitchen"
      color="neutral"
      variant="soft"
      title="Kitchen unavailable"
      description="This kitchen could not be found."
    />

    <div v-else-if="menus.length" class="space-y-3">
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
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No published menus"
      description="This kitchen has not published a menu yet."
    />

    <DevJson
      v-if="isDev"
      title="Kitchen public menu debug"
      context="Kitchen menu index · /kitchens/[slug]/menus"
      :data="pageDebug"
      :default-open="true"
      :hide-when-empty="false"
    />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenPublicMenu } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'

const {
  kitchenSlug,
  kitchen,
  menus,
  pending,
  menuLink,
  debug,
} = useKitchenPublicMenu()
const isDev = import.meta.dev
const pageDebug = computed(() => ({
  route: debug.value.route,
  rendered: {
    hasKitchen: Boolean(kitchen.value),
    kitchenId: kitchen.value?.id ?? '',
    kitchenName: kitchen.value?.name ?? '',
    kitchenStyle: {
      imageUrl: kitchen.value?.image_url ?? '',
      primaryLanguage: kitchen.value?.primary_language ?? '',
      currencyCode: kitchen.value?.currency_code ?? '',
      currencyFormat: kitchen.value?.currency_format ?? '',
    },
    pending: pending.value,
    menusCount: menus.value.length,
    menuLinks: menus.value.map((menu) => ({
      id: menu.id,
      name: menu.name,
      status: menu.status,
      to: menuLink(menu.id),
    })),
  },
  source: {
    kitchenLookup: debug.value.kitchenLookup,
    menuLookup: debug.value.menuLookup,
    pending: debug.value.pending,
  },
}))
</script>
