<template>
  <div
    v-if="visible"
    data-dev-note="true"
    :data-dev-note-title="title"
    class="fireux-dev-note rounded-lg px-4 py-3 text-xs text-dimmed"
  >
    <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
      Developer Note
    </p>

    <p class="mb-2">{{ summary }}</p>
    <p class="mb-2">{{ auth }}</p>

    <ul data-dev-note-body class="list-disc space-y-1 pl-4">
      <li v-for="item in items" :key="item">
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  summary: string
  auth: string
  items: string[]
}>()
</script>
