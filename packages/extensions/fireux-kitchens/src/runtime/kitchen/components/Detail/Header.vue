<template>
  <div class="kitchen-venue-header">
    <div class="kitchen-venue-header__navigation">
      <UButton
        to="/kitchens"
        label="All Kitchens"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
      />
      <div>
        <PublicKitchenDetailSproochli
          v-if="kitchen.sproochli?.enabled"
          :sproochli="kitchen.sproochli"
        />
      </div>
    </div>
    <PlaceDetailHeader :place="place" />
    <UNavigationMenu
      :items="navigation"
      aria-label="Kitchen"
      class="kitchen-venue-header__sections"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { placeContactLinks } from 'fireux-places/runtime/place/utils/place-contact'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { useRoute } from '#imports'
import {
  menuRouteIndexPath,
  directoryMenuRouteScope,
} from '../../../menu/utils/navigation/route'
import type { KitchenDetailPresentation } from '../../types/public'

const props = defineProps<{
  kitchen: KitchenDetailPresentation
  place: Place
}>()
const route = useRoute()
const navigation = computed(() => [
  {
    label: 'Menu',
    to: {
      path: menuRouteIndexPath(directoryMenuRouteScope(props.kitchen.slug)),
      query: route.query,
    },
    active: false,
  },
  {
    label: 'About',
    to: {
      path: route.path,
      query: route.query,
      hash: '#about',
    },
    active: route.hash === '#about',
  },
  ...(placeContactLinks(props.place).length
    ? [
        {
          label: 'Contact',
          to: { path: route.path, query: route.query, hash: '#contact' },
          active: route.hash === '#contact',
        },
      ]
    : []),
  {
    label: 'Opening hours',
    to: { path: route.path, query: route.query, hash: '#opening-hours' },
    active: route.hash === '#opening-hours',
  },
])
</script>
<style scoped>
.kitchen-venue-header {
  display: grid;
  gap: calc(var(--spacing) * 6);
}
.kitchen-venue-header__navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}
.kitchen-venue-header__sections {
  padding-block: calc(var(--spacing) * 2);
  border-bottom: 1px solid var(--ui-border);
}
</style>
