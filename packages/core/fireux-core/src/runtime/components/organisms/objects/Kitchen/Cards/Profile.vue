<script setup lang="ts">
interface Props {
  object: { id?: string; name: string }
}
const props = defineProps<Props>()
</script>
<template>
  <div
    class="objects cards profile kitchen-profile-card"
    :data-id="props.object.id"
  >
    <div class="header">
      <div class="info">
        <div class="title">{{ props.object.name }}</div>
        <div class="subtitle">Kitchen</div>
      </div>
    </div>
    <div class="description">Operational workspace.</div>
  </div>
</template>
