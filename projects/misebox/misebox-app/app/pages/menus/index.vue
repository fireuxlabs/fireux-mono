<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Menus"
      description="Uploaded menu documents."
    />

    <UPageBody class="pagebody">
      <UploadedMenuCollectionManager
        :collection="menus"
        :pending="pending"
        :error="Boolean(error)"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UploadedMenuSummary } from '../../composables/menus/useUploadedMenuInterface'

definePageMeta({
  layout: 'default',
  index: false,
  sitemap: false,
  name: 'UploadedMenusIndexPage',
})

const { data, pending, error } = await useAsyncData(
  'misebox-uploaded-menus',
  () => $fetch<UploadedMenuSummary[]>('/api/menus')
)

const menus = computed(() => data.value ?? [])
</script>
