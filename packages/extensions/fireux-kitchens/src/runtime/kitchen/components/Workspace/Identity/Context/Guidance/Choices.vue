<template>
  <section aria-label="Shared kitchen guidance" class="kitchen-guidance">
    <div>
      <h2>Shared guidance</h2>
      <p>
        Choose the guidance that fits your kitchen. Add what is different in
        Kitchen context below. Your own details take priority.
      </p>
    </div>
    <div v-for="guide in kitchenGuidance" :key="guide.id">
      <UCheckbox
        :model-value="selected.includes(guide.id)"
        :label="guide.title"
        :description="guide.summary"
        :disabled="disabled || saving"
        @update:model-value="toggle(guide.id, $event === true)"
      />
      <details class="kitchen-guidance__preview">
        <summary>Read guidance</summary>
        <ul>
          <li v-for="line in guide.guidance" :key="line">{{ line }}</li>
        </ul>
      </details>
    </div>
    <p class="kitchen-guidance__note">
      Only selected guidance is supplied to connected KitchenAI workflows.
      Choosing a guide does not change your menu, stock or operating settings.
      Notes from other kitchens are never included here.
    </p>
    <FireCopyError v-if="error" :message="error" />
    <div class="fx-card__actions">
      <UButton
        v-if="error"
        label="Reload saved guidance"
        color="neutral"
        variant="soft"
        :disabled="saving"
        @click="emit('reload')"
      />
      <UButton
        label="Save shared guidance"
        :loading="saving"
        :disabled="disabled || saving || !dirty"
        @click="emit('save', [...selected])"
      />
      <UButton
        v-if="dirty"
        label="Reset selection"
        color="neutral"
        variant="ghost"
        :disabled="saving"
        @click="selected = [...value]"
      />
    </div>
    <p v-if="saved && !dirty" role="status">Shared guidance saved.</p>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  kitchenGuidance,
  type KitchenGuidanceId,
} from '../../../../../content/guidance'
const props = defineProps<{
  value: KitchenGuidanceId[]
  disabled?: boolean
  saving?: boolean
  saved?: boolean
  error?: string
}>()
const emit = defineEmits<{ save: [ids: KitchenGuidanceId[]]; reload: [] }>()
const selected = ref([...props.value])
const dirty = computed(
  () =>
    selected.value.length !== props.value.length ||
    selected.value.some((id) => !props.value.includes(id))
)
watch(
  () => props.value,
  (value) => {
    selected.value = [...value]
  }
)
function toggle(id: KitchenGuidanceId, checked: boolean) {
  selected.value = checked
    ? [...new Set([...selected.value, id])]
    : selected.value.filter((value) => value !== id)
}
</script>
<style scoped>
.kitchen-guidance {
  display: grid;
  gap: calc(var(--spacing) * 4);
  min-width: 0;
}
.kitchen-guidance__preview {
  margin-block-start: calc(var(--spacing) * 2);
}
.kitchen-guidance__preview summary {
  cursor: pointer;
}
.kitchen-guidance__preview ul {
  padding-inline-start: calc(var(--spacing) * 6);
  list-style: disc;
}
.kitchen-guidance__preview li + li {
  margin-block-start: calc(var(--spacing) * 2);
}
.kitchen-guidance__note {
  color: var(--ui-text-muted);
}
</style>
