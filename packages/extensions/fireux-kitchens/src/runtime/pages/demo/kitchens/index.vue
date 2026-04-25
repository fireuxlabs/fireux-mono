<template>
  <UPage>
    <UPageHeader
      title="Demo Kitchens"
      description="Public demo kitchen surfaces outside the console."
    />

    <UPageBody class="space-y-4">
      <UCard
        v-for="kitchen in kitchens"
        :key="kitchen.id"
      >
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div class="space-y-1">
            <div class="text-lg font-semibold">
              {{ kitchen.name || 'Demo kitchen' }}
            </div>
            <div class="text-sm text-dimmed">
              {{ kitchen.short_address || 'Kitchen simulation' }}
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="resolveDefaultMenuId(kitchen.id)"
              variant="soft"
              :to="resolvePreviewTo(kitchen.id, 'qr')"
            >
              QR
            </UButton>
            <UButton
              v-if="resolveDefaultMenuId(kitchen.id)"
              :to="resolvePreviewTo(kitchen.id, 'kiosk')"
            >
              Kiosk
            </UButton>
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getDemoKitchenCollection } from '../../../composables/fireux/app/utils/kitchen-demo-scenarios'
import { useKitchenCollection } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import type { Menu } from '../../../models/menu.model'

definePageMeta({
  layout: 'default',
  title: 'Demo Kitchens',
  description: 'Public demo kitchen surfaces.',
  head: { title: 'Demo Kitchens' },
  name: 'DemoKitchensIndexPage',
})

const { kitchens: demoKitchens } = useKitchenCollection({
  source: 'demo',
})

const kitchens = computed(() => demoKitchens.value)

const resolveDefaultMenuId = (kitchenId: string) => {
  const menus = getDemoKitchenCollection<Menu>(kitchenId, 'menus')
    .filter((menu) => Boolean(menu?.active))
    .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))

  return String(menus[0]?.id || '').trim()
}

const resolvePreviewTo = (
  kitchenId: string,
  surface: 'qr' | 'kiosk'
) => {
  const menuId = resolveDefaultMenuId(kitchenId)
  if (!menuId) return undefined

  return {
    path: `/demo/kitchens/${encodeURIComponent(
      kitchenId
    )}/menu/${encodeURIComponent(menuId)}`,
    query: {
      surface,
    },
  }
}
</script>
