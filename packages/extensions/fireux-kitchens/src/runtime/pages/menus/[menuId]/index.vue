<template>
  <UPage v-if="publicMenu">
    <UPageHeader
      :title="publicMenu.name || 'Menu doorway'"
      description="This public menu doorway shows the root record before any source or kitchen menu rendering is added."
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
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { computed } from 'vue'
import { useMenuFetch } from '../../../composables/fireux/public/menu/useMenuFetch'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicSingleMenuDetailPage',
})

const route = useRoute()
const menuId = computed(() => String(route.params.menuId || '').trim())
const { menu: publicMenu } = useMenuFetch(menuId)
const menuJson = computed(() => JSON.stringify(publicMenu.value, null, 2))

useSeoMeta({
  title: computed(() => publicMenu.value?.name || 'Menu'),
  description: computed(
    () => publicMenu.value?.description || 'Open this public menu.'
  ),
})
</script>
