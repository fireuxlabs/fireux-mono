<template>
  <section class="pagebody" aria-labelledby="meta-legal">
    <h2 id="meta-legal" class="fx-type-section-title">
      App-specific legal information
    </h2>
    <p>
      <ULink to="/legal">Read the full legal information</ULink> for shared
      terms, privacy and browser storage.
    </p>
    <UPageList v-if="notices.length">
      <FireLegalNotice
        v-for="notice in notices"
        :key="notice.id"
        :notice="notice"
        role="listitem"
      />
    </UPageList>
    <p v-else>No App-specific legal notices are published.</p>
  </section>
</template>

<script setup lang="ts">
import type { FireuxMetaLegalNotice } from 'fireux-core/runtime/app/literature/types'

defineProps<{ notices: FireuxMetaLegalNotice[] }>()
</script>
