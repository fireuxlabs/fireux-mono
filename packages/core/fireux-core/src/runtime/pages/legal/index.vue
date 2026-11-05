<template>
  <UPage>
    <UPageHeader
      title="Legal"
      description="Service terms, privacy information, and browser storage for this App."
    />

    <UPageBody>
      <FireLegalAppNotices />
      <FireLegalDocuments />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'

const fireux = useFireUXConfig()
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')

definePageMeta({
  layout: 'default',
  title: 'Legal',
  description:
    'Service terms, privacy information, and browser storage for this App.',
  name: 'LegalIndexPage',
})

useSeoMeta({
  title: computed(() => `Legal · ${appName.value}`),
  description: computed(
    () =>
      `Service terms, privacy information, and browser storage for ${appName.value}.`
  ),
})
</script>
