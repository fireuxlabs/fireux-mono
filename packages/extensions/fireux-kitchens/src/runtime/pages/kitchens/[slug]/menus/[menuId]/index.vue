<template>
  <UPage>
    <UPageHeader
      title="Kitchen menu doorway"
      description="This route still shows the kitchen-scoped public menu record while the root menu doorway is built in phases."
    />

    <UPageBody>
      <pre class="overflow-auto rounded-xl border border-default bg-muted p-4 text-xs">{{ publicMenuJson }}</pre>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuFetch } from '../../../../../composables/fireux/public/menu/useMenuFetch'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
})

const route = useRoute()
const menuId = computed(() => String(route.params.menuId || '').trim())
const kitchenSlug = computed(() => String(route.params.slug || '').trim())
const { menu: publicMenu } = useMenuFetch(menuId, { kitchenSlug })
const publicMenuJson = computed(() =>
  JSON.stringify(publicMenu.value, null, 2)
)
</script>
