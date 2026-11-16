<template>
  <div class="pagebody">
    <FireState
      :outcome="outcome"
      entity="public App metadata"
      retryable
      @retry="refresh()"
    />
    <template v-if="outcome === 'ready' && metadata">
      <FireMetaCopy :copy="metadata.messaging" />
      <FireMetaSeo :seo="metadata.seo" />
      <FireMetaLegal :notices="metadata.legal.notices ?? []" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import type { AsyncDataHandlerContext, NuxtApp } from 'nuxt/app'
import { resolveReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import type { readAppMeta } from 'fireux-core/runtime/app/server/index/meta'

type PublicAppMeta = Awaited<ReturnType<typeof readAppMeta>>

const {
  data: metadata,
  status,
  refresh,
} = await useAsyncData(
  'public-app-meta',
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
