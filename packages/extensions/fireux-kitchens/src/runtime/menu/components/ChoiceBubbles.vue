<template>
  <ul class="menu-choice-bubbles" :aria-label="label">
    <li v-for="option in options" :key="option.id">
      <label v-if="interactive && !action" class="menu-choice-bubble">
        <input
          :type="multiple ? 'checkbox' : 'radio'"
          :name="name"
          :value="option.id"
          :checked="selectedIds.includes(option.id)"
          @change="emit('choose', option.id)"
        />
        <span>{{ option.label }}</span>
        <small>{{ option.priceLabel }}</small>
      </label>
      <button
        v-else-if="action"
        type="button"
        class="menu-choice-bubble"
        @click="emit('choose', option.id)"
      >
        <span>{{ option.label }}</span>
        <small>{{ option.priceLabel }}</small>
      </button>
      <span v-else class="menu-choice-bubble menu-choice-bubble--display">
        <span>{{ option.label }}</span>
        <small>{{ option.priceLabel }}</small>
      </span>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { useId } from 'vue'
withDefaults(
  defineProps<{
    label: string
    options: Array<{ id: string; label: string; priceLabel: string }>
    interactive?: boolean
    action?: boolean
    multiple?: boolean
    selectedIds?: string[]
  }>(),
  { interactive: false, action: false, multiple: false, selectedIds: () => [] }
)
const emit = defineEmits<{ choose: [id: string] }>()
const name = useId()
</script>
<style scoped>
.menu-choice-bubbles {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.menu-choice-bubbles li {
  max-inline-size: 100%;
}
.menu-choice-bubble {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  min-block-size: 2.75rem;
  max-inline-size: 100%;
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  border: 1px solid
    color-mix(in srgb, var(--menu-primary, var(--ui-primary)) 30%, transparent);
  border-radius: 999px;
  background: color-mix(
    in srgb,
    var(--menu-primary, var(--ui-primary)) 5%,
    transparent
  );
  color: var(--menu-text, var(--ui-text));
  font-family: inherit;
  font-size: 0.8125rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
  cursor: pointer;
}
.menu-choice-bubble input {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  opacity: 0;
}
.menu-choice-bubble:has(input:checked) {
  border-color: var(--menu-primary, var(--ui-primary));
  background: color-mix(
    in srgb,
    var(--menu-primary, var(--ui-primary)) 18%,
    transparent
  );
  box-shadow: inset 0 0 0 1px var(--menu-primary, var(--ui-primary));
}
.menu-choice-bubble:has(input:focus-visible) {
  outline: 2px solid var(--menu-primary, var(--ui-primary));
  outline-offset: 3px;
}
.menu-choice-bubble small {
  color: var(--menu-muted, var(--ui-text-muted));
  font-size: inherit;
  font-variant-numeric: tabular-nums;
}
.menu-choice-bubble--display {
  min-block-size: 2rem;
  cursor: default;
}
</style>
