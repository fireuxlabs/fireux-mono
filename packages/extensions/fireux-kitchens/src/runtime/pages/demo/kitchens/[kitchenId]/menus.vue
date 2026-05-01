<template>
  <UPage>
    <UPageHeader :title="menusTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="kitchenTo"
        >
          Back
        </UButton>
        <UBadge variant="soft" color="neutral">
          Demo
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-4">
      <div v-if="loading" class="py-10 text-sm opacity-70">
        Loading demo kitchen menus...
      </div>

      <div v-else-if="!kitchen" class="space-y-2">
        <h1 class="text-lg font-semibold">Demo Kitchen Not Found</h1>
        <p>The demo kitchen you are looking for does not exist.</p>
        <NuxtLink to="/demo/kitchens" class="text-primary hover:underline">
          &larr; Back
        </NuxtLink>
      </div>

      <UCard v-else>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Menus</div>
            <p class="text-xs text-dimmed">
              Choose a customer-facing demo menu surface.
            </p>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="menu in sortedMenus"
            :key="menu.id || menu.name"
            class="flex flex-col gap-3 rounded border border-default p-3 md:flex-row md:items-center md:justify-between"
          >
            <div class="space-y-1">
              <div class="font-medium">
                {{ menu.name || menu.id || 'Untitled menu' }}
              </div>
              <div v-if="menu.description" class="text-sm text-dimmed">
                {{ menu.description }}
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                size="xs"
                variant="soft"
                :to="menuSurfaceTo(menu.id, 'qr')"
              >
                QR
              </UButton>
              <UButton
                size="xs"
                :to="menuSurfaceTo(menu.id, 'kiosk')"
              >
                Kiosk
              </UButton>
            </div>
          </div>

          <p v-if="!sortedMenus.length" class="text-sm text-dimmed">
            No demo menus available yet.
          </p>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import { getDemoKitchenCollection } from '../../../../composables/fireux/app/utils/kitchen-demo-scenarios'
import { useKitchenFetch } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { Menu } from '../../../../models/menu.model'

definePageMeta({
  layout: 'default',
  title: 'Demo Kitchen Menus',
  description: 'Public demo kitchen menu list.',
  head: { title: 'Demo Kitchen Menus' },
  name: 'DemoKitchenMenusPage',
})

const route = useRoute()
const kitchenRouteKey = computed(() => {
  const raw = route.params.kitchenId
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})

const { kitchen, pending } = useKitchenFetch(kitchenRouteKey, {
  source: 'demo',
  hydrate: false,
})

const loading = computed(() => Boolean(kitchenRouteKey.value) && pending.value)
const sortedMenus = computed(() =>
  getDemoKitchenCollection<Menu>(kitchenRouteKey.value, 'menus').sort(
    (a, b) =>
      Number(a?.sort_order || 0) - Number(b?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)

const menuSurfaceTo = (menuIdRaw: unknown, surface: 'qr' | 'kiosk') => {
  const resolvedKitchenId = String(kitchenRouteKey.value || '').trim()
  const menuId = String(menuIdRaw || '').trim()
  if (!resolvedKitchenId || !menuId) return ''

  return {
    path: `/demo/kitchens/${encodeURIComponent(
      resolvedKitchenId
    )}/menu/${encodeURIComponent(menuId)}`,
    query: {
      surface,
    },
  }
}

const pageTitle = computed(() => String((kitchen.value as any)?.name || 'Demo Kitchen'))
const pageDescription = computed(() =>
  String(
    (kitchen.value as any)?.short_address ||
      (kitchen.value as any)?.formatted_address ||
      'Choose a customer-facing demo menu.'
  )
)
const menusTitle = computed(() => `${pageTitle.value} Menus`)
const kitchenTo = computed(() => {
  const resolvedKitchenId = String(kitchenRouteKey.value || '').trim()
  if (!resolvedKitchenId) return '/demo/kitchens'

  return `/demo/kitchens/${encodeURIComponent(resolvedKitchenId)}`
})
</script>
