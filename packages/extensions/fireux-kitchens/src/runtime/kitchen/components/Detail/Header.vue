<template>
  <div>
    <div>
      <UButton
        to="/kitchens"
        label="All Kitchens"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
      />
      <div>
        <KitchenDetailSproochli
          v-if="kitchen.sproochli?.enabled"
          :sproochli="kitchen.sproochli"
        />
      </div>
    </div>
    <PlaceDetailHeader :place="place" />
    <UNavigationMenu :items="navigation" aria-label="Kitchen" />
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
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.response.ts'

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
