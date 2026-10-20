<template>
  <div>
    <p v-if="flow.recoveryError" role="alert" class="mb-4 text-sm text-warning">
      {{ flow.recoveryError }}
    </p>
    <MenuSelectionConfirmation
      v-if="flow.submission"
      :submission="flow.submission"
      :response-title="flow.responseTitle"
      :response-message="flow.responseMessage"
      :pending="flow.pending"
      :venue="venue"
      :error="flow.error"
      @refresh="flow.refresh"
      @reset="flow.reset"
    />
    <form v-else class="space-y-4" @submit.prevent="submit">
      <fieldset :disabled="flow.locked" class="space-y-3">
        <MenuOrderDetails
          v-model:name="flow.name"
          v-model:phone="flow.phone"
          context="collection"
          @blur="touched[$event] = true"
        />
      </fieldset>
      <p v-for="issue in visibleIssues" :key="issue" class="text-sm text-muted">
        {{ issue }}
      </p>
      <p v-if="flow.error" role="alert" class="text-sm text-error">
        {{ flow.error }}
      </p>
      <UButton
        type="submit"
        :label="
          flow.locked && !flow.pending
            ? 'Retry order'
            : 'Place Collection order'
        "
        block
        size="lg"
        :disabled="blocked"
        :loading="flow.pending"
      />
    </form>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, type UnwrapRef } from 'vue'
import type { useCollectionCheckout } from '../../composables/useCollectionCheckout'
import type { KitchenDetailPresentation } from '../../../kitchen/models/kitchen-detail.response'
const props = defineProps<{
  flow: UnwrapRef<ReturnType<typeof useCollectionCheckout>>
  venue?: KitchenDetailPresentation | null
}>()
// Presentation timing only; flow.submit retains all validation and command guards.
const touched = ref({ name: false, phone: false })
const attempted = ref(false)
const requiredFields: Record<string, 'name' | 'phone'> = {
  'Customer name is required.': 'name',
  'Contact phone is required.': 'phone',
}
const visibleIssues = computed(() =>
  props.flow.issues.filter((issue) => {
    const field = requiredFields[issue]
    return !field || attempted.value || touched.value[field]
  })
)
const blocked = computed(() =>
  props.flow.issues.some((issue) => !requiredFields[issue])
)
function submit() {
  attempted.value = true
  return props.flow.submit()
}
</script>
