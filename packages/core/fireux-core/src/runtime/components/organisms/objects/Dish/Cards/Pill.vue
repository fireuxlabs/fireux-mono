<script setup lang="ts">
interface Props {
  name: string
  id?: string
}
const props = defineProps<Props>()
</script>
<template>
  <div class="objects cards cell dish-pill" :data-id="props.id">
    <div class="header">
      <div class="info">
        <div class="title">{{ props.name }}</div>
        <div class="subtitle">Dish</div>
      </div>
    </div>
  </div>
</template>
