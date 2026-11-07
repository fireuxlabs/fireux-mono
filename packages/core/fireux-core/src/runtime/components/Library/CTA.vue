<template>
  <div>
    <div>
      <h1>Call to Action demo</h1>
      <p>Using Nuxt UI 4 UPageCTA</p>
    </div>

    <UPageCTA
      title="Start your FireUX journey"
      description="Try the new Nuxt UI 4 components across the suite."
      :links="[
        {
          label: 'Get started',
          color: 'primary',
          to: '/',
          icon: 'i-heroicons-rocket-launch-20-solid',
        },
        {
          label: 'Docs',
          variant: 'ghost',
          color: 'neutral',
          to: 'https://ui4.nuxt.com',
          target: '_blank',
        },
      ]"
    />

    <UCard>
      <template #header>
        <div>Inline CTA</div>
      </template>
      <div class="fx-card__actions">
        <UButton color="primary">Primary action</UButton>
        <UButton variant="soft" color="neutral">Secondary</UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// UPageCTA and other components are auto-imported by @nuxt/ui v4
</script>
