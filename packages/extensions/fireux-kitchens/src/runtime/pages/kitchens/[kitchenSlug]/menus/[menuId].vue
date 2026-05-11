<template>
  <OrganismsMenuPreview
    :menu="kitchenMenu"
    :show-language-debug="showLanguageDebug"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useKitchenMenu } from '../../../../composables/fireux/app/useKitchenMenu'

definePageMeta({
  layout: 'public-menu',
  title: 'Kitchen Menu',
  description: 'Public menu view.',
  head: { title: 'Kitchen Menu' },
  name: 'KitchenPublicMenusDetailPage',
})

const route = useRoute()
const kitchenMenu = useKitchenMenu()
const showLanguageDebug = computed(() => {
  const raw = route.query.debug || route.query.dev
  const value = Array.isArray(raw) ? raw[0] : raw
  return ['1', 'true', 'language', 'menu'].includes(String(value || '').toLowerCase())
})
</script>
