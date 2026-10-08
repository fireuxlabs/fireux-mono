<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UButton
        to="/kitchens"
        label="All Kitchens"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
      />
      <div class="flex flex-wrap gap-3">
        <KitchenDetailSproochli
          v-if="kitchen.sproochli?.enabled"
          :sproochli="kitchen.sproochli"
        />
      </div>
    </div>
    <PlaceHeader :place="place" />
    <UNavigationMenu
      :items="navigation"
      class="border-b border-default pt-2"
      aria-label="Kitchen"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { placeContactLinks } from 'fireux-places/runtime/place/utils/place-contact'
import PlaceHeader from 'fireux-places/runtime/place/components/Header.vue'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { useRoute } from '#imports'
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.response.ts'

const props = defineProps<{
  kitchen: KitchenDetailPresentation
  place: Place
}>()
const route = useRoute()
const navigation = computed(() => [
  {
    label: 'Menus',
    to: {
      path: route.path,
      query: route.query,
      hash: '#menus',
    },
    active: !route.hash || route.hash === '#menus',
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
