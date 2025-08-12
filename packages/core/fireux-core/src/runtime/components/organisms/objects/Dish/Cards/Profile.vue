<script setup lang="ts">
interface Props {
  object: { id?: string; name: string }
}
const props = defineProps<Props>()
</script>
<template>
  <div
    class="objects cards profile dish-profile-card"
    :data-id="props.object.id"
  >
    <div class="header">
      <div class="info">
        <div class="title">{{ props.object.name }}</div>
        <div class="subtitle">Dish</div>
      </div>
    </div>
    <div class="description">Sellable dish item.</div>
  </div>
</template>
