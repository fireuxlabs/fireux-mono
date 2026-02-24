<template>
  <UPageSection class="py-12 lg:py-16">
    <div class="flex items-end justify-between mb-6">
      <h2 class="text-2xl lg:text-3xl font-bold">Our Apps</h2>
      <UBadge variant="soft" color="primary">{{ apps.length }}</UBadge>
    </div>

    <div class="flex flex-wrap gap-2">
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
  </UPageSection>
</template>

<script setup lang="ts">
type AppKey = 'misebox' | 'niederhorn'

const apps = [
  { key: 'misebox', name: 'Misebox', text: 'M', src: '/img/app/logo.png' },
  { key: 'niederhorn', name: 'Niederhorn', text: 'N', src: '' },
] as const

const publicApps = (useRuntimeConfig().public as any)?.apps as
  | Partial<Record<AppKey, string>>
  | undefined

const devBaseUrl = (key: AppKey) =>
  ({
    misebox: 'http://localhost:3001',
    niederhorn: 'http://localhost:3003',
  })[key]

const hrefFor = (key: AppKey) => {
  if (import.meta.dev) return devBaseUrl(key)
  const raw = publicApps?.[key]
  return typeof raw === 'string' && raw.trim()
    ? raw.trim().replace(/\/+$/, '')
    : ''
}
</script>
