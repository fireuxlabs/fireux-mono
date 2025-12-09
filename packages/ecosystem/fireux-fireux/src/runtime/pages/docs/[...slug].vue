<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
      :headline="headline"
    >
      <template #links>
        <UButton
          v-for="(link, index) in page.links"
          :key="index"
          v-bind="link"
        />

        <PageHeaderLinks />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer v-if="page" :value="page" />

      <USeparator v-if="surround?.length" />

      <UContentSurround :surround="surround" />
    </UPageBody>

    <template v-if="page?.body?.toc?.links?.length" #right>
      <UContentToc :title="toc?.title" :links="page.body?.toc?.links">
        <template v-if="toc?.bottom" #bottom>
          <div
            class="hidden lg:block space-y-6"
            :class="{ '!mt-6': page.body?.toc?.links?.length }"
          >
            <USeparator v-if="page.body?.toc?.links?.length" type="dashed" />

            <UPageLinks :title="toc.bottom.title" :links="links" />
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>

  <div v-else class="space-y-3">
    <h1 class="text-2xl font-semibold mb-2">Page not found</h1>
    <p class="text-sm text-dimmed">
      We couldn’t find that doc yet. Try going back to the main docs index.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useHead } from '#imports'
import { findPageHeadline } from '@nuxt/content/utils'
import type { ContentNavigationItem } from '@nuxt/content'

definePageMeta({
  layout: 'docs',
  title: 'Docs',
  nav: {
    key: 'docs',
    label: 'Docs',
    icon: 'i-lucide-book-open',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['docs'],
  },
})

const route = useRoute()
const { toc } = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const sourcePath = computed(() => {
  const stripped = route.path.replace(/^\/docs/, '') || '/'
  return stripped === '' ? '/' : stripped
})

const { data: page } = await useAsyncData(
  `fireux-docs-page-${sourcePath.value}`,
  () =>
    queryContent({ source: 'fireuxDocs' })
      .where({ _path: sourcePath.value })
      .findOne()
)

const { data: surround } = await useAsyncData(
  `fireux-docs-surround-${sourcePath.value}`,
  () =>
    queryContent({ source: 'fireuxDocs' })
      .without(['body'])
      .findSurround(sourcePath.value, { fields: ['description'] })
)

const title = computed(() => page.value?.seo?.title || page.value?.title)
const description = computed(
  () => page.value?.seo?.description || page.value?.description
)

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})

const headline = computed(() =>
  findPageHeadline(navigation?.value, page.value?.path)
)

defineOgImageComponent('Docs', {
  headline: headline.value,
})

const links = computed(() => {
  const nextLinks = [] as any[]
  if (toc?.bottom?.edit && page?.value?.stem && page?.value?.extension) {
    nextLinks.push({
      icon: 'i-lucide-external-link',
      label: 'Edit this page',
      to: `${toc.bottom.edit}/${page.value.stem}.${page.value.extension}`,
      target: '_blank',
    })
  }

  return [...nextLinks, ...(toc?.bottom?.links || [])].filter(Boolean)
})

useHead({ title: 'FireUX Docs' })
</script>
