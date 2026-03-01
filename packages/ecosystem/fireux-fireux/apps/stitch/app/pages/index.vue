<template>
  <UPage>
    <UPageBody class="pagebody space-y-8 py-8">
      <UCard class="overflow-hidden">
        <div class="hero space-y-6 p-6 md:p-10">
          <UBadge label="Stitch" color="primary" variant="soft" class="w-fit" />

          <div class="space-y-3">
            <h1 class="text-3xl font-semibold tracking-tight md:text-5xl">
              Stitch connects specialist SEO capacity to the teams that need it.
            </h1>
            <p class="max-w-3xl text-base text-muted md:text-lg">
              Browse providers, connect on fit, and request capacity through one focused layer.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <UButton to="/directory" color="primary" icon="i-lucide-search">
              Browse providers
            </UButton>
            <UButton to="/join" color="neutral" variant="outline" icon="i-lucide-user-plus">
              Join as a provider
            </UButton>
          </div>
        </div>
      </UCard>

      <USeparator />

      <div class="grid gap-4 md:grid-cols-3">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-list" class="text-primary" />
              <p class="font-medium">List</p>
            </div>
          </template>
          <p class="text-sm text-muted">Public provider directory with clear tags and availability.</p>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-link" class="text-primary" />
              <p class="font-medium">Connect</p>
            </div>
          </template>
          <p class="text-sm text-muted">Share capability context and connect quickly around request scope.</p>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-briefcase-business" class="text-primary" />
              <p class="font-medium">Request capacity</p>
            </div>
          </template>
          <p class="text-sm text-muted">Create and manage SEO capacity requests from the internal console.</p>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Stitch',
})

useSeoMeta({
  title: 'Stitch',
  description:
    'Stitch connects specialist SEO capacity to the teams that need it. Browse providers, connect, and request capacity.',
})
</script>

<style scoped>
.hero {
  background:
    radial-gradient(1200px 420px at -10% -20%, color-mix(in srgb, var(--ui-primary) 25%, transparent), transparent),
    radial-gradient(900px 340px at 110% 140%, color-mix(in srgb, var(--ui-secondary) 22%, transparent), transparent);
}
</style>
