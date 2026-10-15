<template>
  <section class="space-y-5" aria-label="Current app">
    <MoleculesStateCard
      v-if="appPending"
      entity="app"
      kind="document"
      loading
    />
    <MoleculesStateCard
      v-else-if="appError"
      entity="app"
      kind="document"
      state="error"
    />
    <MoleculesStateCard
      v-else-if="!appCard"
      entity="app"
      kind="document"
      state="missing"
    />
    <UPageCard v-else title="Current App" icon="i-lucide-box" variant="subtle">
      <AppCardsCell v-bind="appCard" link />
      <dl class="mt-5 divide-y divide-default text-sm">
        <div class="py-3 first:pt-0">
          <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
            App ID
          </dt>
          <dd class="mt-1 break-words font-mono text-highlighted">
            {{ appCard.id }}
          </dd>
        </div>
        <div class="py-3 last:pb-0">
          <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
            Ecosystem
          </dt>
          <dd class="mt-1 font-medium text-highlighted">
            {{ appCard.ecosystem || 'Not assigned' }}
          </dd>
        </div>
      </dl>
    </UPageCard>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useAppRead } from '../../composables/useAppRead'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { useAppView } from '../../composables/useAppView'
const { appId } = useFireUXConfig()
const { app, pending: appPending, error: appError } = useAppRead(appId)
const { toCard: toAppCard } = useAppView(app)
const appCard = computed(() => toAppCard(app.value))
</script>
