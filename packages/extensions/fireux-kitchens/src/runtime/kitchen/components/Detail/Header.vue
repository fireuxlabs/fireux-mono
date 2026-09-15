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
        <UButton
          v-if="canManage"
          :to="`/places/${encodeURIComponent(kitchen.id)}/edit`"
          label="Edit identity"
          icon="i-lucide-pencil"
          color="neutral"
          variant="soft"
        />
      </div>
    </div>
    <KitchenHeader :kitchen="kitchen" :compact="compact" />
    <UNavigationMenu
      :items="navigation"
      class="border-b border-default pt-4"
      aria-label="Kitchen"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
} from '../../utils/kitchen-menu-route'
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.response.ts'

const props = defineProps<{
  kitchen: KitchenDetailPresentation
  compact?: boolean
}>()
const route = useRoute()
const kitchenPath = computed(
  () => `/kitchens/${encodeURIComponent(props.kitchen.slug)}`
)
const menusPath = computed(() =>
  menuRouteIndexPath(directoryMenuRouteScope(props.kitchen.slug))
)
const navigation = computed(() => [
  {
    label: 'Menus',
    to: menusPath.value,
    active: route.path.startsWith(menusPath.value),
  },
  {
    label: 'About',
    to: kitchenPath.value,
    active: route.path.replace(/\/$/, '') === kitchenPath.value,
  },
])
const { isAdmin, isDeveloper } = useUserSession()
const canManage = computed(() => isAdmin.value || isDeveloper.value)
</script>
