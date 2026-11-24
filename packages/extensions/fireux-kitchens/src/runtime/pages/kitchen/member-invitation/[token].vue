<template>
  <UContainer>
    <UCard>
      <div class="fx-card-body-stack">
        <div>
          <UIcon name="i-lucide-user-round-check" />
        </div>

        <template v-if="accepted">
          <h1>You joined as {{ accepted.memberName }}</h1>
          <p>Your account is linked to this Kitchen Team member.</p>
          <UButton
            :to="continueTo"
            label="Continue to Kitchen"
            trailing
            icon="i-lucide-arrow-right"
          />
        </template>

        <FireState v-else-if="pending" outcome="pending" entity="invitation" />

        <UAlert
          v-else-if="failure"
          title="Invitation unavailable"
          :description="failure"
          color="error"
          variant="subtle"
        />

        <template v-else-if="invitation">
          <div>
            <p>Kitchen invitation</p>
            <h1>Join as {{ invitation.memberName }}</h1>
          </div>
          <p>
            This will link your signed-in User to the existing Kitchen member.
          </p>
          <UAlert v-if="actionFailure" color="error" :title="actionFailure" />
          <UButton
            v-if="authState !== 'AUTHENTICATED'"
            :to="authTo"
            label="Sign in to continue"
            icon="i-lucide-log-in"
            block
          />
          <UButton
            v-else
            :label="`Join as ${invitation.memberName}`"
            :loading="accepting"
            block
            @click="acceptInvitation"
          />
        </template>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { useFetch } from 'nuxt/app'
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { authRedirectPath } from 'fireux-core/runtime/user/utils/auth-redirect'

definePageMeta({ requiresAuth: false })

const token = useRouteParam('token')
const endpoint = computed(
  () => `/api/kitchen/member-invitations/${encodeURIComponent(token.value)}`
)
const { authState, currentUser } = useAuth()
const scope = [token, () => currentUser.value?.uid]
const capture = useCommandScope(scope)
const accepting = ref(false)
const accepted = ref<{ kitchenId: string; memberName: string } | null>(null)
const actionFailure = ref('')
watch(
  scope,
  () => {
    accepted.value = null
    accepting.value = false
    actionFailure.value = ''
  },
  { flush: 'sync' }
)
const {
  data: invitation,
  pending,
  error,
} = await useFetch<{
  ok: true
  memberName: string
  expiresAt: string
}>(endpoint)
const failure = computed(() =>
  String(
    (error.value?.data as { statusMessage?: unknown } | undefined)
      ?.statusMessage ||
      error.value?.message ||
      ''
  ).trim()
)
const authTo = computed(() =>
  authRedirectPath(
    `/kitchen/member-invitation/${encodeURIComponent(token.value)}`
  )
)
const continueTo = computed(() => accepted.value ? '/dashboard' : undefined)

async function acceptInvitation() {
  const user = currentUser.value
  if (!user || user.isAnonymous || accepting.value || accepted.value) return
  const isCurrent = capture()
  const target = endpoint.value
  accepting.value = true
  actionFailure.value = ''
  try {
    const authToken = await user.getIdToken()
    if (!isCurrent()) return
    const result = await $fetch<{
      ok: true
      kitchenId: string
      memberName: string
      memberId: string
    }>(target, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (isCurrent()) accepted.value = result
  } catch (cause) {
    if (!isCurrent()) return
    const error = cause as {
      data?: { statusMessage?: string }
      message?: string
    }
    actionFailure.value =
      error.data?.statusMessage ||
      error.message ||
      'Invitation could not be accepted.'
  } finally {
    if (isCurrent()) accepting.value = false
  }
}
</script>
