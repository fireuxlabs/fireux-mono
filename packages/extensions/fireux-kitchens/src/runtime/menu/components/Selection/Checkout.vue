<template>
  <div>
    <p v-if="flow.recoveryError" role="alert" class="menu-checkout__recovery">
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
    <p v-if="flow.kiosk && flow.submission" class="menu-checkout__issue">
      Keep your order number and pay at the counter. This screen returns to the
      start after 30 seconds.
    </p>
    <form
      v-else-if="!flow.submission"
      class="menu-checkout"
      @submit.prevent="submit"
    >
      <fieldset :disabled="flow.locked" class="menu-checkout__details">
        <MenuOrderDetails
          v-if="!flow.kiosk"
          v-model:name="flow.name"
          v-model:phone="flow.phone"
          context="collection"
          @blur="touched[$event] = true"
        />
      </fieldset>
      <p
        v-for="issue in visibleIssues"
        :key="issue"
        class="menu-checkout__issue"
      >
        {{ issue }}
      </p>
      <p v-if="flow.error" role="alert" class="menu-checkout__error">
        {{ flow.error }}
      </p>
      <UButton
        type="submit"
        :label="
          flow.locked && !flow.pending
            ? 'Retry order'
            : `Place ${flow.label} order`
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
import type { useServiceCheckout } from '../../composables/useServiceCheckout'
import type { KitchenDetailPresentation } from '../../../kitchen/models/kitchen-detail.response'
const props = defineProps<{
  flow: UnwrapRef<ReturnType<typeof useServiceCheckout>>
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

<style scoped>
.menu-checkout,
.menu-checkout__details {
  display: grid;
  gap: 1rem;
}
.menu-checkout__details {
  border: 0;
  padding: 0;
}
.menu-checkout__recovery {
  color: var(--ui-warning);
  margin-bottom: 1rem;
}
.menu-checkout__issue {
  color: var(--ui-text-muted);
  font-size: 0.875rem;
}
.menu-checkout__error {
  color: var(--ui-error);
  font-size: 0.875rem;
}
</style>
