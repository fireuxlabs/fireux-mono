<template>
  <section class="space-y-3" aria-labelledby="allowed-websites-title">
    <div>
      <h3 id="allowed-websites-title" class="font-semibold">
        Allowed websites
      </h3>
      <p class="mt-1 text-sm text-muted">
        Only these websites may embed ordering. Add the www address separately
        if you use it.
      </p>
    </div>
    <MoleculesStateCard
      v-if="outcome === 'idle' || outcome === 'pending'"
      entity="Allowed websites"
      loading
    />
    <MoleculesCopyError v-else-if="error" :message="error" />
    <template v-else>
      <UFormField
        label="Website origins"
        description="One per line. Use HTTPS without a page path."
      >
        <UTextarea
          v-model="text"
          :rows="4"
          placeholder="https://baeren-ringgenberg.ch&#10;https://www.baeren-ringgenberg.ch"
          :disabled="!canWrite || busy"
          class="w-full"
        />
      </UFormField>
      <div class="flex flex-wrap items-center gap-3">
        <UButton
          label="Save allowed websites"
          :loading="busy"
          :disabled="!canWrite || !changed"
          @click="save"
        /><span v-if="saved" role="status" class="text-sm text-success"
          >Saved</span
        >
      </div>
      <MoleculesCopyError v-if="saveError" :message="saveError" />
      <p v-if="!origins.length" class="text-sm text-muted">
        No external websites are allowed yet.
      </p>
    </template>
    <p class="text-xs text-muted">
      The workspace preview is allowed automatically. Public ordering links can
      still be opened or shared directly.
    </p>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenWebsiteOrdering } from '../../../composables/workspace/integrations/useKitchenWebsiteOrdering'
import { normalizeAllowedWebsites } from '../../../utils/allowed-websites'
const { kitchenId, origins, outcome, error, canWrite, update } =
  useKitchenWebsiteOrdering()
const text = ref(''),
  busy = ref(false),
  saveError = ref(''),
  saved = ref(false)
const changed = computed(() => text.value.trim() !== origins.value.join('\n'))
watch(
  [kitchenId, origins],
  () => {
    text.value = origins.value.join('\n')
    saveError.value = ''
    saved.value = false
  },
  { immediate: true }
)
watch(text, () => {
  saved.value = false
})
async function save() {
  if (busy.value || !canWrite.value) return
  const id = kitchenId.value
  busy.value = true
  saveError.value = ''
  saved.value = false
  try {
    const values = normalizeAllowedWebsites(
      text.value
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean),
      import.meta.dev
    )
    await update(values)
    if (kitchenId.value === id) {
      text.value = values.join('\n')
      saved.value = true
    }
  } catch (cause) {
    if (kitchenId.value === id)
      saveError.value =
        cause instanceof Error
          ? cause.message
          : 'Could not save allowed websites.'
  } finally {
    busy.value = false
  }
}
</script>
