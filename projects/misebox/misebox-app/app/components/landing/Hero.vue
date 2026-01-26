<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="hero-title">Professional recruitment for kitchens</h1>
    </div>

    <div class="space-y-4">
      <p class="text-base lg:text-xl leading-relaxed max-w-prose">
        Recruit
        <NuxtLink class="text-primary" to="/professionals">
          professionals
        </NuxtLink>
        for your
        <NuxtLink class="text-primary" to="/kitchens">kitchen</NuxtLink>.
        <NuxtLink class="text-primary" to="/jobs">Post</NuxtLink> positions,
        preview candidates, and manage hiring in one place.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 pt-6">
        <UButton variant="solid" size="lg" :to="hero.primary.to">
          {{ hero.primary.label }}
        </UButton>
        <UButton
          variant="outline"
          size="lg"
          :to="hero.secondary.to"
          trailing-icon="i-heroicons-arrow-right"
        >
          {{ hero.secondary.label }}
        </UButton>
      </div>
    </div>

    <ul class="grid gap-3 sm:grid-cols-2 pt-4">
      <li class="flex items-center gap-2 text-sm">
        <UIcon name="i-lucide-briefcase" class="shrink-0" />
        <span>Post jobs and share a single link</span>
      </li>
      <li class="flex items-center gap-2 text-sm">
        <UIcon name="i-lucide-user" class="shrink-0" />
        <span>Professional profiles instead of CVs</span>
      </li>
      <li class="flex items-center gap-2 text-sm">
        <UIcon name="i-lucide-chef-hat" class="shrink-0" />
        <span>Kitchen pages that attract the right people</span>
      </li>
      <li class="flex items-center gap-2 text-sm">
        <UIcon name="i-lucide-send" class="shrink-0" />
        <span>Direct contact — no middlemen</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const hero = {
  primary: { label: 'Post a job', to: '/jobs' },
  secondary: { label: 'Browse professionals', to: '/professionals' },
}

</script>

<style scoped>
.hero-title {
  font-weight: var(--font-weight-black);
  font-size: clamp(2.75rem, 6vw, 4.5rem);
  line-height: 1.15;
  color: var(--ui-text);
}
.hero-title strong {
  font-weight: inherit;
}
.hero-title--accent {
  color: var(--color-primary-500);
}
</style>
