<template>
  <NuxtPage v-if="hasChildRoute" />

  <UPage v-else>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/demo/kitchens"
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
        Loading demo kitchen...
      </div>

      <div v-else-if="!kitchen" class="space-y-2">
        <h1 class="text-lg font-semibold">Demo Kitchen Not Found</h1>
        <p>The demo kitchen you are looking for does not exist.</p>
        <NuxtLink to="/demo/kitchens" class="text-primary hover:underline">
          &larr; Back
        </NuxtLink>
      </div>

      <template v-else>
        <UCard>
          <div class="grid gap-4 md:grid-cols-[minmax(0,240px)_1fr] md:items-center">
            <img
              v-if="heroImage"
              :src="heroImage"
              :alt="pageTitle"
              class="h-48 w-full rounded object-cover md:h-56"
            />

            <div class="space-y-4">
              <div class="flex flex-wrap items-center gap-2">
                <UBadge variant="soft" color="neutral">
                  Demo kitchen
                </UBadge>
                <UBadge v-if="sortedMenus.length" variant="soft">
                  {{ sortedMenus.length }} menus
                </UBadge>
              </div>

              <div class="space-y-2">
                <h2 class="text-2xl font-semibold">
                  {{ pageTitle }}
                </h2>
                <p class="text-sm text-dimmed">
                  {{ pageDescription }}
                </p>
                <p v-if="identityDescription" class="text-sm text-toned">
                  {{ identityDescription }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UButton :to="menusTo">
                  View menus
                </UButton>
                <UButton
                  v-if="firstMenuId"
                  variant="soft"
                  :to="menuSurfaceTo(firstMenuId, 'qr')"
                >
                  Open QR menu
                </UButton>
                <UButton
                  v-if="firstMenuId"
                  variant="ghost"
                  :to="menuSurfaceTo(firstMenuId, 'kiosk')"
                >
                  Open kiosk
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import { getDemoKitchenCollection } from '../../../composables/fireux/demo/kitchen/scenarios'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { Menu } from '../../../models/menu.model'

definePageMeta({
  layout: 'default',
  title: 'Demo Kitchen',
  description: 'Public demo kitchen view.',
  head: { title: 'Demo Kitchen' },
  name: 'DemoKitchensDetailPage',
})

const route = useRoute()
const hasChildRoute = computed(() => {
  const path = String(route.path || '').trim()
  return /\/demo\/kitchens\/[^/]+\/menus(?:\/|$)/.test(path) ||
    /\/demo\/kitchens\/[^/]+\/menu(?:\/|$)/.test(path)
})

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
const firstMenuId = computed(() => String(sortedMenus.value[0]?.id || '').trim())
const menusTo = computed(() => {
  const resolvedKitchenId = String(kitchenRouteKey.value || '').trim()
  if (!resolvedKitchenId) return '/demo/kitchens'

  return `/demo/kitchens/${encodeURIComponent(resolvedKitchenId)}/menus`
})

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
      'Demo kitchen details.'
  )
)
const identityDescription = computed(() =>
  String(
    (kitchen.value as any)?.label ||
      (kitchen.value as any)?.description ||
      ''
  ).trim()
)
const heroImage = computed(() =>
  String(
    (kitchen.value as any)?.image_url ||
      (kitchen.value as any)?.image ||
      ''
  ).trim()
)
</script>
