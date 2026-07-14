<template>
  <UPage>
    <UPageHeader
      title="Neuste Informationen"
      description="Nachrichten und Veranstaltungen des Hotel Bären."
    >
      <template #links>
        <UBadge color="neutral" variant="subtle">Archiv</UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="grid gap-4 md:grid-cols-2">
        <UCard v-for="post in baerenNewsPosts" :key="post.slug">
          <div class="space-y-3">
            <time :datetime="post.publishedAt" class="text-sm text-muted">
              {{ formatDate(post.publishedAt) }}
            </time>
            <h2 class="text-xl font-semibold text-highlighted">{{ post.title }}</h2>
            <p class="text-muted">{{ post.summary }}</p>
            <UButton
              :to="`/news/${post.slug}`"
              label="Weiterlesen"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-arrow-right"
            />
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { baerenNewsPosts } from '../../data/news'

definePageMeta({
  layout: 'default',
  nav: {
    key: 'news',
    label: 'News',
    icon: 'i-lucide-newspaper',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeoMeta({
  title: 'News | Hotel Bären Ringgenberg',
  description: 'Nachrichten und Veranstaltungen des Hotel Bären Ringgenberg.',
})

const formatDate = (value: string) => new Intl.DateTimeFormat('de-CH', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date(`${value}T12:00:00`))
</script>
