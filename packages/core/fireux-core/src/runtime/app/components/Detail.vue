<template>
  <article
    data-app-projection="detail"
    :data-app-id="app.id"
    class="mx-auto max-w-3xl space-y-6"
  >
    <UButton
      to="/apps"
      icon="i-lucide-arrow-left"
      variant="link"
      color="neutral"
      class="px-0"
      >All apps</UButton
    >
    <div
      class="overflow-hidden rounded-3xl border border-default bg-elevated/30"
    >
      <img
        v-if="card.coverUrl"
        :src="card.coverUrl"
        alt=""
        class="aspect-[21/9] w-full object-cover"
      />
      <div class="space-y-6 p-6 sm:p-10">
        <div class="flex items-center gap-4">
          <UAvatar
            :src="card.logoUrl || card.imageUrl || undefined"
            :text="card.avatarText"
            :alt="card.displayName"
            size="3xl"
          />
          <h1
            class="min-w-0 text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl"
          >
            {{ card.displayName }}
          </h1>
        </div>
        <p v-if="card.tagline" class="text-xl text-highlighted">
          {{ card.tagline }}
        </p>
        <p
          v-if="card.description"
          class="whitespace-pre-line text-base leading-relaxed text-muted"
        >
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
          >Open {{ card.displayName }}</UButton
        >
        <p v-else class="text-sm text-muted">
          This app hasn’t added a public address yet.
        </p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSeo } from '../../composables/fireux/seo/useSeo'
import { useAppView } from '../composables/useAppView'
import { useFireUXConfig } from '../composables/config/FireUXConfig'
import type { App } from '../models/app.model'

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
