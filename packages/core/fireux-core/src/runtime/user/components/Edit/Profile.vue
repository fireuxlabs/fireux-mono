<template>
  <div class="pagebody">
    <FireState v-if="isPending" outcome="pending" entity="your profile" />
    <FireState
      v-else-if="outcome === 'error' || error"
      outcome="error"
      entity="your profile"
      retryable
      @retry="reload"
    />
    <UButton
      v-else-if="!user"
      to="/users/create?redirect=%2Fdashboard%2Fuser-profile"
      label="Set up your profile"
    />
    <template v-else>
      <div v-if="publicPath" class="fx-card__actions">
        <UButton
          :to="publicPath"
          label="View public profile"
          icon="i-lucide-external-link"
          color="neutral"
          variant="soft"
        />
      </div>
      <UserEditCore :user="user" :outcome="outcome" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUserRead } from '../../composables/useUserRead'
import { useUserView } from '../../composables/useUserView'

const { uid } = useAuth()
const { user, outcome, error } = useUserRead(uid)
const { toView } = useUserView()
const publicPath = computed(() => toView(user.value)?.to)
const isPending = computed(
  () => outcome.value === 'idle' || outcome.value === 'pending'
)
function reload() {
  window.location.reload()
}
</script>
