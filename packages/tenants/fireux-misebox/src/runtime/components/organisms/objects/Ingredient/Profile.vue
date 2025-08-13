<script setup lang="ts">
interface Props {
  id?: string
  name: string
}
const props = defineProps<Props>()
</script>
<template>
  <div class="ingredient-profile" :data-id="props.id">
    <h2>{{ props.name }}</h2>
    <p>Ingredient profile (tenant).</p>
  </div>
</template>
