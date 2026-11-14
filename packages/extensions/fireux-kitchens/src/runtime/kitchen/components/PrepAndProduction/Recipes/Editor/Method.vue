<template>
  <section class="recipe-method-editor">
    <h3>Method</h3>
    <div
      v-for="(_step, index) in method"
      :key="index"
      class="recipe-method-editor__step"
    >
      <UFormField :label="`Step ${index + 1}`"
        ><UTextarea
          v-model="method[index]"
          :rows="2"
          :maxlength="4000"
          :disabled="disabled"
      /></UFormField>
      <div class="fx-card__actions">
        <UButton
          :aria-label="`Move step ${index + 1} up`"
          icon="i-lucide-arrow-up"
          color="neutral"
          variant="ghost"
          :disabled="disabled || index === 0"
          @click="move(index, -1)"
        />
        <UButton
          :aria-label="`Move step ${index + 1} down`"
          icon="i-lucide-arrow-down"
          color="neutral"
          variant="ghost"
          :disabled="disabled || index === method.length - 1"
          @click="move(index, 1)"
        />
        <UButton
          :aria-label="`Remove step ${index + 1}`"
          icon="i-lucide-trash-2"
          label="Remove"
          color="neutral"
          variant="ghost"
          :disabled="disabled"
          @click="method.splice(index, 1)"
        />
      </div>
    </div>
    <UButton
      label="Add step"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      :disabled="disabled || method.length >= 100"
      @click="method.push('')"
    />
  </section>
</template>
<script setup lang="ts">
const method = defineModel<string[]>({ required: true })
defineProps<{ disabled: boolean }>()
function move(index: number, delta: number) {
  const [step] = method.value.splice(index, 1)
  if (step !== undefined) method.value.splice(index + delta, 0, step)
}
</script>
<style scoped>
.recipe-method-editor,
.recipe-method-editor__step {
  display: grid;
  gap: calc(var(--spacing) * 3);
}
</style>
