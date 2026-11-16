<template>
  <UAlert
    v-if="appLegalError"
    color="error"
    variant="soft"
    title="App legal information unavailable"
    description="The App-specific legal information could not be loaded."
  />

  <UPageSection
    v-if="appLegalNotices.length"
    title="App-specific legal notices"
  >
    <UPageGrid>
      <FireLegalNotice
        v-for="notice in appLegalNotices"
        :key="notice.id"
        :notice="notice"
      />
    </UPageGrid>
  </UPageSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import type { FireuxMetaLegalNotice } from 'fireux-core/runtime/app/literature/types'

type AppMetaResponse = {
  ok: true
  legal: { notices: FireuxMetaLegalNotice[] }
}

const { data: appMeta, error: appLegalError } = await useAsyncData(
  'legal-app-meta',
  () => $fetch<AppMetaResponse>('/api/app/meta')
)
const appLegalNotices = computed(() => appMeta.value?.legal.notices ?? [])
</script>
