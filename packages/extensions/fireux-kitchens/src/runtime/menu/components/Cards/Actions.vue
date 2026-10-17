<template>
  <nav class="menu-doorways" :aria-label="`${menuName || 'Menu'} options`">
    <UButton
      v-for="doorway in doorways"
      :key="doorway.to"
      :to="doorway.to"
      :icon="doorway.icon"
      :color="doorway.context === 'generic' ? 'primary' : 'neutral'"
      :variant="doorway.context === 'generic' ? 'solid' : 'soft'"
      :size="display === 'icons' ? 'sm' : 'md'"
      :aria-label="display === 'icons' ? doorway.label : undefined"
      :title="display === 'icons' ? doorway.label : undefined"
    >
      <template v-if="display !== 'icons'">
        {{ doorway.label }}
      </template>
    </UButton>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import { normalizeSproochliLanguage } from 'fireux-sproochli/runtime/sproochli'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response'
import { guestDiscoverableMenuSurfaceProfiles, menuContextProfile } from '../../utils/menu-context'
import {
  menuRoutePath,
  type MenuRouteScope,
} from '../../utils/menu-route'

const props = withDefaults(
  defineProps<{
    offerings?: MenuDirectoryEntry['offering_options']
    menuId: string
    menuName?: string
    routeScope: MenuRouteScope
    display?: 'buttons' | 'icons'
  }>(),
  {
    offerings: () => [],
    menuName: '',
    display: 'buttons',
  }
)

const websiteOrdering = useRuntimeConfig().public.ordering?.channels?.includes('website')
const route = useRoute()
const selectedSproochliLanguage = computed(() =>
  normalizeSproochliLanguage(route.query.sproochli)
)
const preserveSproochliLanguage = (to: string) => {
  if (!to || !selectedSproochliLanguage.value) return to

  const [pathAndQuery = '', hash = ''] = to.split('#', 2)
  const [path, query = ''] = pathAndQuery.split('?', 2)
  const params = new URLSearchParams(query)
  params.set('sproochli', selectedSproochliLanguage.value)
  const nextQuery = params.toString()

  return `${path}${nextQuery ? `?${nextQuery}` : ''}${hash ? `#${hash}` : ''}`
}

const doorways = computed(() => {
  return [
    {
      context: 'generic' as const,
      label: 'View menu',
      icon: 'i-lucide-book-open',
      to: preserveSproochliLanguage(
        menuRoutePath({
          scope: props.routeScope,
          menuId: props.menuId,
        })
      ),
    },
    ...(websiteOrdering ? props.offerings.flatMap((service) => {
      if (service.paused) return []
      const profile = service.type === 'dine_in'
        ? menuContextProfile('table')
        : guestDiscoverableMenuSurfaceProfiles.find(
            ({ visibleOrderTypes }) => visibleOrderTypes.includes(service.type)
          )
      if (!profile || !['collection', 'delivery', 'dine_in'].includes(service.type)) return []
      return [{
        context: profile.context,
        icon: profile.icon,
        label: service.type === 'dine_in' ? 'QR table ordering' : profile.label,
        to: preserveSproochliLanguage(menuRoutePath({
          scope: props.routeScope,
          menuId: props.menuId,
          context: profile.context,
          offeringId: service.kitchen_offering_id,
        })),
      }]
    }).filter((doorway, index, all) => all.findIndex(other => other.context === doorway.context) === index) : []),
  ].filter(({ to }) => Boolean(to))
})
</script>

<style scoped>
.menu-doorways {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.6rem;
}

.menu-doorways:has(a[aria-label]) {
  flex-wrap: nowrap;
  justify-content: flex-end;
}

@media (max-width: 44rem) {
  .menu-doorways {
    justify-content: flex-start;
  }

  .menu-doorways :deep(a) {
    flex: 1 1 auto;
  }
}
</style>
