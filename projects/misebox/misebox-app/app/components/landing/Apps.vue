<template>
  <div class="landing-index-section">
    <div class="mb-6 text-center">
      <h2 class="text-2xl lg:text-3xl font-bold">Our Apps</h2>
    </div>

    <div class="flex flex-wrap justify-center gap-2">
      <UTooltip
        v-for="app in apps"
        :key="app.key"
        :text="app.name"
      >
        <a
          v-if="hrefFor(app.key)"
          :href="hrefFor(app.key)"
          :aria-label="`Open ${app.name}`"
          class="inline-flex rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <UAvatar
            :src="app.src || undefined"
            :alt="app.name"
            :text="app.text"
            size="md"
          />
        </a>
        <UAvatar
          v-else
          :src="app.src || undefined"
          :alt="app.name"
          :text="app.text"
          size="md"
        />
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app'

type AppKey = 'misebox'

const apps = [
  { key: 'misebox', name: 'Misebox', text: 'M', src: '/img/app/logo.png' },
] as const

const publicApps = (useRuntimeConfig().public as any)?.apps as
  | Partial<Record<AppKey, string>>
  | undefined

const devBaseUrl = (key: AppKey) =>
  ({
    misebox: 'http://localhost:3001',
  })[key]

const hrefFor = (key: AppKey) => {
  if (import.meta.dev) return devBaseUrl(key)
  const raw = publicApps?.[key]
  return typeof raw === 'string' && raw.trim()
    ? raw.trim().replace(/\/+$/, '')
    : ''
}
</script>
