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
    <form v-else class="space-y-4" @submit.prevent="flow.submit">
      <fieldset :disabled="flow.locked" class="space-y-3">
        <MenuOrderDetails
          v-model:name="flow.name"
          v-model:phone="flow.phone"
          context="collection"
        />
      </fieldset>
      <p v-for="issue in flow.issues" :key="issue" class="text-sm text-muted">
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
        :disabled="flow.issues.length > 0"
        :loading="flow.pending"
      />
    </form>
  </div>
</template>
<script setup lang="ts">
import type { UnwrapRef } from 'vue'
import type { useCollectionCheckout } from '../../composables/useCollectionCheckout'
import type { KitchenDetailPresentation } from '../../../kitchen/models/kitchen-detail.response'
defineProps<{
  flow: UnwrapRef<ReturnType<typeof useCollectionCheckout>>
  venue?: KitchenDetailPresentation | null
}>()
</script>
