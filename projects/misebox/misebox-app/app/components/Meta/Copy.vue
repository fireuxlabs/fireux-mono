<template>
  <section class="pagebody" aria-labelledby="meta-copy">
    <h2 id="meta-copy" class="fx-type-section-title">Copy</h2>
    <UCard variant="subtle">
      <div class="fx-card-body-stack">
        <div class="fx-card-body-stack">
          <p class="fx-type-label">{{ readable(copy.hero_headline) }}</p>
          <p class="fx-type-section-title">{{ readable(copy.hero_prefix) }}</p>
          <p class="fx-type-description">{{ readable(copy.hero_html) }}</p>
        </div>
        <USeparator />
        <UPageGrid as="dl">
          <div>
            <dt class="fx-type-label">Summary</dt>
            <dd>{{ readable(copy.summary) }}</dd>
          </div>
          <div>
            <dt class="fx-type-label">Workspace connection</dt>
            <dd>{{ readable(copy.workspace_bridge_html) }}</dd>
          </div>
          <div>
            <dt class="fx-type-label">Highlight terms</dt>
            <dd>{{ copy.highlight_terms.join(', ') || 'None set' }}</dd>
          </div>
        </UPageGrid>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { readAppMeta } from 'fireux-core/runtime/app/server/index/meta'

defineProps<{
  copy: Awaited<ReturnType<typeof readAppMeta>>['messaging']
}>()

function readable(value?: string): string {
  return (
    value
      ?.replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Not set'
  )
}
</script>
