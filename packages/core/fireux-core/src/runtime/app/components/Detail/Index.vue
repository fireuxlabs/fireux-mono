<template>
  <article data-app-projection="detail" :data-app-id="app.id">
    <UButton
      to="/apps"
      icon="i-lucide-arrow-left"
      variant="link"
      color="neutral"
      >All apps</UButton
    >
    <div>
      <img v-if="card.coverUrl" :src="card.coverUrl" alt="" />
      <div>
        <div>
          <UAvatar
            :src="card.logoUrl || card.thumbnailUrl || undefined"
            :text="card.avatarText"
            :alt="card.name"
            size="3xl"
          />
          <h1>
            {{ card.name }}
          </h1>
        </div>
        <p v-if="card.tagline">
          {{ card.tagline }}
        </p>
        <p v-if="card.description">
          {{ card.description }}
        </p>
        <UButton
          v-if="entry"
          :to="entry"
          :external="!isCurrentApp"
          :icon="
            isCurrentApp ? 'i-lucide-arrow-right' : 'i-lucide-external-link'
          "
          trailing
          size="lg"
          >Open {{ card.name }}</UButton
        >
        <p v-else>This app hasn’t added a public address yet.</p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSeo } from '../../../composables/fireux/seo/useSeo'
import { useAppView } from '../../composables/useAppView'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import type { App } from '../../models/model'

const props = defineProps<{ app: App }>()
const config = useFireUXConfig()
const { toCard } = useAppView()
const card = computed(() => toCard(props.app)!)
const isCurrentApp = computed(() => props.app.id === config.appId)
const entry = computed(() => {
  if (isCurrentApp.value) return config.homePath || '/'
  try {
    const url = new URL(props.app.social_links?.website || '')
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
})

useSeo({
  title: computed(() => props.app.name || props.app.id || 'App'),
  description: computed(
    () => props.app.description || 'Published app profile.'
  ),
  path: computed(() => `/apps/${encodeURIComponent(props.app.id)}`),
  image: computed(
    () =>
      props.app.media?.cover_url || props.app.media?.thumbnail_url || undefined
  ),
})
</script>
