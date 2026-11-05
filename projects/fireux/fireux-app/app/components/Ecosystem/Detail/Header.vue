<template>
  <UPageHeader :title="ecosystem.name" :description="ecosystem.description">
    <template #headline>Ecosystem</template>
    <template #links>
      <UButton
        to="/ecosystems"
        label="All Ecosystems"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
      />
      <UButton
        v-if="ecosystem.website_url"
        :to="ecosystem.website_url"
        label="Visit Ecosystem"
        icon="i-lucide-external-link"
        color="neutral"
        variant="soft"
        target="_blank"
      />
    </template>
  </UPageHeader>
</template>

<script setup lang="ts">
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'
defineProps<{ ecosystem: Ecosystem }>()
</script>
