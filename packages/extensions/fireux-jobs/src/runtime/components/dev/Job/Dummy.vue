<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Job card surfaces</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Pill and cell variants with a real-looking payload.</p>
      </div>
    </template>

    <div class="space-y-4">
      <JobCardsPill v-bind="pill" :show-badges="true" />
      <JobCardsCell v-bind="cell" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevJobDummy' })

const pill = {
  to: '',
  avatarUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=240&q=80',
  title: 'Chef de Partie · Alpine Kitchen',
  badges: ['Housing', 'Full-time'],
}

const cell = {
  to: '',
  avatarUrl: pill.avatarUrl,
  title: pill.title,
  subtitle: 'St. Moritz, CH',
  status: 'open',
  description: 'Seasonal alpine kitchen role with a tight, experienced brigade. Housing included.',
  badges: ['Housing', 'Full-time'],
}
</script>
