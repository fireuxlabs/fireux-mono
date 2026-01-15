<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <OrganismsObjectsBlogCTA />
      <OrganismsObjectsBlogCollectionManager :cards="cards" :total="total" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useBlogFetch } from '../../composables/fireux/firestore/objects/blog/fetch/useBlogFetch'
import { useBlogInterface } from '../../composables/fireux/firestore/objects/blog/utils/view/useBlogInterface'

const { appName } = useFireUXConfig()

const pageTitle = 'Blog'
const pageDescription = 'Latest articles.'

definePageMeta({
  layout: 'default',
  title: 'Blog',
  description: 'Latest articles.',
  nav: {
    key: 'blog',
    label: 'Blog',
    icon: 'i-lucide-book',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  head: { title: 'Blog' },
})

useHead({ title: `${appName} | ${pageTitle}` })

const { items } = useBlogFetch()
const { card: makeCard } = useBlogInterface()

const cards = computed(() =>
  (items.value ?? [])
    .map((post) => makeCard(post))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const total = computed(() => cards.value.length)
</script>
