<template>
  <slot
    :menu="menu"
    :pending="pending"
    :error="error"
    :menu-json="menuJson"
  >
    <UPage v-if="menu">
      <UPageHeader
        :title="menu.name || 'Menu'"
        description="This menu record is the first surface before source, structured dishes, or tenant chrome are added."
      />

      <UPageBody>
        <pre class="overflow-auto rounded-xl border border-default bg-muted p-4 text-xs">{{ menuJson }}</pre>
      </UPageBody>
    </UPage>

    <UPage v-else>
      <UPageBody>
        <p class="text-sm text-dimmed">
          Menu unavailable.
        </p>
      </UPageBody>
    </UPage>
  </slot>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { computed } from 'vue'
import {
  useMenuFetch,
  type PublicMenu,
} from '../composables/fireux/public/menu/useMenuFetch'

const props = defineProps<{
  menuId: string
  kitchenSlug?: string
}>()

defineSlots<{
  default?: (props: {
    menu: PublicMenu | null
    pending: boolean
    error: unknown
    menuJson: string
  }) => unknown
}>()

const text = (value: unknown) => String(value ?? '').trim()
const menuId = computed(() => text(props.menuId))
const kitchenSlug = computed(() => text(props.kitchenSlug))
const {
  menu,
  pending,
  error,
} = useMenuFetch(menuId, { kitchenSlug })
const menuJson = computed(() => JSON.stringify(menu.value, null, 2))

useSeoMeta({
  title: computed(() => menu.value?.name || 'Menu'),
  description: computed(
    () => menu.value?.description || 'Open this menu.'
  ),
})
</script>
