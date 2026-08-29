<template>
  <div class="grid gap-5">
    <div class="grid gap-4 lg:grid-cols-2">
      <UPageCard
        title="Discover Projects"
        description="Browse public FireUX Projects and the Apps and Ecosystems they operate."
        icon="i-lucide-briefcase-business"
        to="/projects"
        variant="subtle"
      />
      <UPageCard
        title="Manage your Project portfolio"
        description="Start with a free Project Workspace for one Project. Professional also supports one Project. Business operates multiple Projects and Apps."
        icon="i-lucide-badge-check"
        to="/pricing"
        variant="subtle"
      />
    </div>

    <nav
      aria-label="Explore FireUX"
      class="flex flex-wrap gap-x-5 gap-y-2 border-t border-default pt-5 text-sm"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="font-medium text-muted hover:text-highlighted"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const links = [
  { label: 'Apps', to: '/apps' },
  { label: 'Ecosystems', to: '/ecosystems' },
  { label: 'Projects', to: '/projects' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
] as const
</script>
