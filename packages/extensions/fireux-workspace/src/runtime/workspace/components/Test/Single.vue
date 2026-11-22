<template>
  <WorkspaceSingleCard v-if="record" :name="record.value" :to="to">
    <template #avatar
      ><UAvatar icon="i-lucide-flask-conical" size="xl"
    /></template>
  </WorkspaceSingleCard>
  <p v-else class="fx-type-caption">Choose a Test from the collection.</p>
</template>
<script setup lang="ts">
defineProps<{ record: { id: string; value: string } | null; to: string }>()
</script>
