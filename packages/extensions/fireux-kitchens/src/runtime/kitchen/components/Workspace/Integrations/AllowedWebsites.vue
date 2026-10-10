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
          :disabled="!canWrite || busy || !changed"
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
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { computed, ref, watch } from 'vue'
import { useKitchenWebsiteOrdering } from '../../../composables/workspace/integrations/useKitchenWebsiteOrdering'
import { normalizeAllowedWebsites } from '../../../utils/allowed-websites'
const { origins, outcome, error, canWrite, update, captureIntent, ownerScope } =
  useKitchenWebsiteOrdering()
const text = ref(''),
  baseline = ref(''),
  busy = ref(false),
  saveError = ref(''),
  saved = ref(false)
const changed = computed(() => text.value.trim() !== baseline.value)
watch(
  ownerScope,
  () => {
    baseline.value = ''
    text.value = ''
    busy.value = false
    saveError.value = ''
    saved.value = false
  },
  { immediate: true, flush: 'sync' }
)
watch(
  [ownerScope, outcome, origins],
  () => {
    if (outcome.value !== 'ready') return
    const dirty = changed.value
    const next = origins.value.join('\n')
    baseline.value = next
    if (!dirty) text.value = next
  },
  { immediate: true, flush: 'sync' }
)
const captureSurface = useCommandScope([ownerScope, text])
watch(
  [ownerScope, text],
  () => {
    busy.value = false
    saveError.value = ''
    saved.value = false
  },
  { flush: 'sync' }
)
async function save() {
  if (busy.value || !canWrite.value) return
  const local = captureSurface()
  const owner = captureIntent()
  const isCurrent = () => local() && owner()
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
    await update(values, isCurrent)
    if (isCurrent()) {
      busy.value = false
      baseline.value = values.join('\n')
      text.value = baseline.value
      saved.value = true
    }
  } catch (cause) {
    if (isCurrent())
      saveError.value =
        cause instanceof Error
          ? cause.message
          : 'Could not save allowed websites.'
  } finally {
    if (local()) busy.value = false
  }
}
</script>
