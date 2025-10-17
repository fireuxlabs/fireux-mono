<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="hero-title"><strong>Mise</strong> en place</h1>
      <h1 class="hero-title hero-title--accent">Culinary Excellence</h1>
    </div>

    <p class="text-base lg:text-xl leading-relaxed max-w-prose">
      The complete platform for culinary professionals to manage recipes,
      inventory, and kitchen operations with
      <span class="text-primary">precision workflows</span> &amp;
      <span class="text-primary">ingredient tracking</span>.
    </p>

    <div class="flex items-center gap-6 pt-2">
      <img
        src="/logo-type-light.png"
        alt="Flagship tenant"
        class="h-10 opacity-80"
      />
      <img
        src="/logo-type-light.png"
        alt="Flagship tenant"
        class="h-10 opacity-80"
      />
    </div>

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

    <ul class="grid gap-3 sm:grid-cols-2 pt-4">
      <li class="flex items-center gap-2 text-sm">
        <UIcon name="i-lucide-book-open" class="shrink-0" />
        <span>Recipe cards with cost &amp; scaling</span>
      </li>
      <li class="flex items-center gap-2 text-sm">
        <UIcon name="i-lucide-package" class="shrink-0" />
        <span>Inventory &amp; supplier connections</span>
      </li>
      <li class="flex items-center gap-2 text-sm">
        <UIcon name="i-lucide-chef-hat" class="shrink-0" />
        <span>Kitchen prep &amp; workflow tools</span>
      </li>
      <li class="flex items-center gap-2 text-sm">
        <UIcon name="i-lucide-credit-card" class="shrink-0" />
        <span>POS insights &amp; cost control</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
const hero = {
  primary: { label: 'Get Started', to: '/get-started' },
  secondary: { label: 'Explore Kitchens', to: '/kitchens' },
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
