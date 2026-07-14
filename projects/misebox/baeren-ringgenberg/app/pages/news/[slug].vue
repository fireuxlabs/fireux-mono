<template>
  <UPage>
    <UPageHeader :title="post.title" :description="formattedDate">
      <template #headline>
        <UBadge color="neutral" variant="subtle">Newsarchiv</UBadge>
      </template>
      <template #links>
        <UButton
          to="/news"
          label="Alle Meldungen"
          color="neutral"
          variant="outline"
          icon="i-lucide-arrow-left"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <article class="max-w-3xl space-y-4 text-lg text-muted">
        <p v-for="paragraph in post.body" :key="paragraph">{{ paragraph }}</p>
      </article>

      <UButton
        v-if="post.slug === 'neue-menuekarte'"
        to="/menu"
        label="Aktuelle Menükarte"
        icon="i-lucide-utensils"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { findBaerenNewsPost } from '../../data/news'

definePageMeta({ layout: 'default' })

const route = useRoute()
const post = findBaerenNewsPost(String(route.params.slug || ''))

if (!post) {
  throw createError({ statusCode: 404, statusMessage: 'Newsbeitrag nicht gefunden' })
}

const formattedDate = new Intl.DateTimeFormat('de-CH', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date(`${post.publishedAt}T12:00:00`))

useSeoMeta({
  title: `${post.title} | Hotel Bären Ringgenberg`,
  description: post.summary,
})
</script>
