<template>
  <aside
    class="border-b border-default bg-elevated/50 p-6 sm:p-8 lg:border-e lg:border-b-0"
  >
    <AppBrandLogo
      size="large"
      :alt="`${appLabel} logo`"
      class="mb-6 size-14 rounded-xl object-contain"
    />
    <p class="text-sm font-semibold text-primary">{{ ecosystemLabel }}</p>
    <h1 class="mt-2 text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
      Set up your profile
    </h1>
    <p class="mt-3 text-sm leading-6 text-muted">
      Your profile shows people who you are in {{ appLabel }} and the other Apps
      you join.
    </p>

    <ul class="mt-7 space-y-4" aria-label="What account setup creates">
      <li v-for="benefit in benefits" :key="benefit.label" class="flex gap-3">
        <span
          class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
        >
          <UIcon :name="benefit.icon" class="size-4" />
        </span>
        <div>
          <p class="text-sm font-medium text-highlighted">{{ benefit.label }}</p>
          <p class="mt-0.5 text-xs leading-5 text-muted">
            {{ benefit.description }}
          </p>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  appLabel: string
  ecosystemLabel: string
  benefits: Array<{ icon: string; label: string; description: string }>
}>()
</script>
