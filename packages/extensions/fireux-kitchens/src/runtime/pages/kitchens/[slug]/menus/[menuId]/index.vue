<template>
  <pre class="m-4 overflow-auto rounded-xl border border-default bg-muted p-4 text-xs">{{ publicMenuJson }}</pre>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePublicMenuFetch } from '../../../../../composables/fireux/public/menu/usePublicMenuFetch'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
})

const route = useRoute()
const menuId = computed(() => String(route.params.menuId || '').trim())
const kitchenSlug = computed(() => String(route.params.slug || '').trim())
const { menu: publicMenu } = usePublicMenuFetch(menuId, { kitchenSlug })
const publicMenuJson = computed(() =>
  JSON.stringify(publicMenu.value, null, 2)
)
</script>
