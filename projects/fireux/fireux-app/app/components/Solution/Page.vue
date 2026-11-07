<!-- Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: add the FireUX authored solution-page shell. -->
<template>
  <UPage>
    <UButton to="/solutions" variant="link"> Solutions </UButton>
    <UPageHeader
      :title="title"
      :description="description"
      headline="FireUX solution"
    />
    <UPageBody>
      <div class="pagebody">
        <slot />
      </div>

      <div>
        <slot name="actions" />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
