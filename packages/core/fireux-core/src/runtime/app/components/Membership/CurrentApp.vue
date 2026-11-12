<template>
  <section aria-label="Current app">
    <FireState v-if="appPending" entity="app" outcome="pending" />
    <FireState v-else-if="appError" entity="app" outcome="error" />
    <UAlert
      v-else-if="!appCard"
      title="App not found"
      color="neutral"
      variant="soft"
      role="status"
      aria-live="polite"
    />
    <UPageCard v-else title="Current App" icon="i-lucide-box" variant="subtle">
      <AppCardsCell
        :to="homePath"
        :thumbnail-url="appCard.thumbnailUrl"
        :avatar-text="appCard.avatarText"
        :name="appCard.name"
        :badges="appCard.badges"
        :tagline="appCard.tagline"
        link
      />
      <dl class="fx-card__detail-grid">
        <div>
          <dt>App ID</dt>
          <dd>
            {{ appCard.id }}
          </dd>
        </div>
        <div>
          <dt>Ecosystem ID</dt>
          <dd>
            {{ appCard.ecosystemId }}
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
const { appId, homePath } = useFireUXConfig()
const { app, pending: appPending, error: appError } = useAppRead(appId)
const { toCard: toAppCard } = useAppView()
const appCard = computed(() => toAppCard(app.value))
</script>
