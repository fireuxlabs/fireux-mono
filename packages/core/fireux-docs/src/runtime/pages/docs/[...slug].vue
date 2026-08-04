<template>
  <UPage>
    <ContentRenderer v-if="page" :value="page" />
    <UPageHeader
      v-else
      title="Document not found"
      description="This route is not backed by the current repository documentation graph."
    />
  </UPage>
</template>

<script setup lang="ts">
const route = useRoute()
const contentPath = computed(() => route.path.replace(/^\/docs/, '') || '/')
const { data: page } = await useAsyncData(
  () => `fireux-docs:${contentPath.value}`,
  () => queryCollection('fireuxDocs').path(contentPath.value).first(),
  { watch: [contentPath] }
)

if (!page.value) {
  setResponseStatus(404)
}

definePageMeta({ layout: 'docs' })
useSeoMeta({
  title: computed(() => page.value?.title || 'Document not found'),
  description: computed(() => page.value?.description || ''),
})
</script>
