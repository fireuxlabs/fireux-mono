<template>
  <article class="pagebody">
    <AppDetailHeader :app="app" />
    <div class="pagebody">
      <FireState
        :outcome="ecosystemOutcome"
        entity="published Ecosystem"
        :error="ecosystemError"
      />
      <EcosystemDetailProject v-if="ecosystem" :ecosystem="ecosystem" />
      <EcosystemCardsPreview v-if="ecosystem" :ecosystem="ecosystem" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useEcosystemDetail } from 'fireux-core/runtime/ecosystem/composables/useEcosystemDetail'
import { isDirectoryAppIndexable } from '../../../utils/directorySearchPolicy'

const props = defineProps<{ app: App }>()
const {
  ecosystem,
  outcome: ecosystemOutcome,
  error: ecosystemError,
} = useEcosystemDetail(() => props.app.ecosystem_id)

useSeo({
  title: computed(() => `${props.app.name} · FireUX App`),
  description: computed(() => props.app.description || 'FireUX App.'),
  path: computed(() => `/apps/${encodeURIComponent(props.app.id)}`),
  image: computed(
    () => props.app.media?.cover_url || props.app.media?.thumbnail_url
  ),
  robots: computed(() =>
    isDirectoryAppIndexable(props.app.id)
      ? 'index, follow'
      : 'noindex, nofollow'
  ),
})
</script>
