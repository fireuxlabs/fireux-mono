<template>
  <div class="pagebody">
    <UPageCard title="Private account" variant="subtle">
      <FireState
        v-if="outcome === 'idle' || outcome === 'pending'"
        outcome="pending"
        entity="your account"
      />
      <FireState
        v-else-if="outcome === 'error'"
        outcome="error"
        entity="your account"
        retryable
        @retry="reload"
      />
      <UButton
        v-else-if="outcome === 'empty'"
        to="/users/create?redirect=%2Fdashboard%2Fsettings"
        label="Finish account setup"
      />
      <dl v-else-if="account" class="pagebody">
        <div>
          <dt>Email</dt>
          <dd>{{ account.email || 'Not available' }}</dd>
        </div>
        <div>
          <dt>Terms accepted</dt>
          <dd>{{ acceptedAt || 'Not recorded' }}</dd>
        </div>
        <div>
          <dt>Terms version</dt>
          <dd>{{ account.terms?.version || 'Not recorded' }}</dd>
        </div>
      </dl>
    </UPageCard>
    <slot v-if="outcome === 'ready' && account" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserAccount } from '../../composables/account/useUserAccount'
import { formatFirestoreTimestamp } from '../../../utils/firestore-timestamp'

const { account, outcome } = useUserAccount()
const acceptedAt = computed(() =>
  formatFirestoreTimestamp(account.value?.terms?.accepted_at, {
    fallback: '',
    locale: 'en-GB',
  })
)
function reload() {
  window.location.reload()
}
</script>
