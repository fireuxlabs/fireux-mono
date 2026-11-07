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
      <UCard
        v-for="notice in appLegalNotices"
        :key="notice.id"
        variant="subtle"
      >
        <div class="fx-card-body-stack">
          <UBadge v-if="notice.jurisdiction" color="warning" variant="soft">
            {{ notice.jurisdiction }}
          </UBadge>
          <h3 class="fx-type-card-heading">{{ notice.title }}</h3>
          <p class="fx-type-body">{{ notice.description }}</p>

          <ul class="fx-list-stack">
            <li v-for="item in notice.items" :key="item">{{ item }}</li>
          </ul>

          <nav v-if="notice.sources?.length" aria-label="Official guidance">
            <ULink
              v-for="source in notice.sources"
              :key="source.to"
              :to="source.to"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ source.label }}
            </ULink>
          </nav>
        </div>
      </UCard>
    </UPageGrid>
  </UPageSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import type { FireuxMetaLegalNotice } from '../../app/models/meta-content'

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
