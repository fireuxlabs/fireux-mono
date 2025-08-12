<script setup lang="ts">
interface Props {
  object: { id?: string; name: string }
}
const props = defineProps<Props>()
</script>
<template>
  <div
    class="objects cards profile menu-profile-card"
    :data-id="props.object.id"
  >
    <div class="header">
      <div class="info">
        <div class="title">{{ props.object.name }}</div>
        <div class="subtitle">Menu</div>
      </div>
    </div>
    <div class="description">Group of dishes.</div>
  </div>
</template>
