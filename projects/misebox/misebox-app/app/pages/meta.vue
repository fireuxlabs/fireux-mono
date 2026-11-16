<template>
  <UPage>
    <UPageHeader
      title="Public metadata"
      description="The copy, search defaults and legal notices published by Misebox."
      :links="[
        {
          label: 'Read JSON',
          to: '/api/app/meta',
          icon: 'i-lucide-braces',
          color: 'neutral',
          variant: 'outline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      ]"
    />
    <UPageBody>
      <FireState
        :outcome="outcome"
        entity="public App metadata"
        retryable
        @retry="refresh()"
      />
      <template v-if="outcome === 'ready' && metadata">
        <MetaCopy :copy="metadata.messaging" />
        <MetaSeo :seo="metadata.seo" />
        <MetaLegal :notices="metadata.legal.notices ?? []" />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import type { AsyncDataHandlerContext, NuxtApp } from 'nuxt/app'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { resolveReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import type { readAppMeta } from 'fireux-core/runtime/app/server/index/meta'

type PublicAppMeta = Awaited<ReturnType<typeof readAppMeta>>

definePageMeta({
  layout: 'default',
  robots: 'noindex,follow',
  sitemap: false,
  nav: {
    key: 'meta',
    label: 'Metadata',
    icon: 'i-lucide-file-json',
    order: 85,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})

useSeo({
  title: 'Public metadata · Misebox',
  description:
    "Read Misebox's public copy, search and social metadata, and App-specific legal information.",
  path: '/meta',
  image: '/img/app/cover.png',
  robots: 'noindex,follow',
})

const {
  data: metadata,
  status,
  refresh,
} = await useAsyncData(
  'misebox-public-meta',
  (_nuxtApp: NuxtApp, { signal }: AsyncDataHandlerContext) =>
    $fetch<PublicAppMeta>('/api/app/meta', { signal })
)
const outcome = computed(() =>
  resolveReadOutcome({
    enabled: status.value !== 'idle',
    pending: status.value === 'pending',
    failed: status.value === 'error',
    present: metadata.value?.ok === true,
  })
)
</script>
