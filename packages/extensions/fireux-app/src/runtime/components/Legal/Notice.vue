<template>
  <UCard variant="subtle">
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
        <ul class="fx-list-stack">
          <li v-for="source in notice.sources" :key="source.to">
            <ULink :to="source.to" target="_blank" rel="noopener noreferrer">
              {{ source.label }}
            </ULink>
          </li>
        </ul>
      </nav>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { FireuxMetaLegalNotice } from 'fireux-core/runtime/app/literature/types'

defineProps<{ notice: FireuxMetaLegalNotice }>()
</script>
