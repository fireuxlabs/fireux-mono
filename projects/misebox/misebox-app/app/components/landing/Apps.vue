<template>
  <div class="landing-index-section">
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-bold lg:text-3xl">Our Apps</h2>
    </div>

    <div class="flex flex-wrap justify-center gap-2">
      <UTooltip
        v-for="app in apps"
        :key="app.key"
        :text="app.name"
      >
        <a
          :href="app.href"
          :aria-label="`Open ${app.name}`"
          class="inline-flex items-center gap-2 rounded-full border border-default bg-default/70 px-2.5 py-1.5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <UAvatar
            :src="app.src"
            :alt="app.name"
            :text="app.text"
            size="xs"
          />
          <span>{{ app.name }}</span>
        </a>
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
const apps = [
  {
    key: 'misebox',
    name: 'Misebox',
    text: 'M',
    src: '/img/app/logo.png',
    href: '/about',
  },
  {
    key: 'la-tap-berne',
    name: 'La Tap Berne',
    text: 'LT',
    src: 'https://tapberne.web.app/img/app/thumbnail.png',
    href: '/apps/la-tap-berne',
  },
] as const
</script>
