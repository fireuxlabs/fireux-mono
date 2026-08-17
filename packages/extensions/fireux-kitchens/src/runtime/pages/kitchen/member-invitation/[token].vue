<template>
  <UContainer class="flex min-h-[70dvh] max-w-xl items-center py-12">
    <UCard class="w-full">
      <div class="space-y-5 text-center">
        <div
          class="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"
        >
          <UIcon name="i-lucide-user-round-check" class="size-6" />
        </div>

        <template v-if="pending">
          <USkeleton class="mx-auto h-7 w-48" />
          <USkeleton class="mx-auto h-5 w-72 max-w-full" />
        </template>

        <UAlert
          v-else-if="failure"
          title="Invitation unavailable"
          :description="failure"
          color="error"
          variant="subtle"
        />

        <template v-else-if="accepted">
          <h1 class="text-2xl font-semibold text-highlighted">
            You joined as {{ invitation?.memberName }}
          </h1>
          <p class="text-toned">
            Your User is now linked to this Kitchen member.
          </p>
          <UButton
            :to="memberTo"
            label="View Kitchen team"
            trailing
            icon="i-lucide-arrow-right"
          />
        </template>

        <template v-else-if="invitation">
          <div>
            <p class="text-sm font-medium text-primary">Kitchen invitation</p>
            <h1 class="mt-1 text-2xl font-semibold text-highlighted">
              Join as {{ invitation.memberName }}
            </h1>
          </div>
          <p class="text-toned">
            This will link your signed-in User to the existing Kitchen member.
          </p>
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
import { computed, ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'

definePageMeta({ requiresAuth: false })

const route = useRoute()
const token = useRouteParam('token')
const endpoint = computed(
  () => `/api/kitchen/member-invitations/${encodeURIComponent(token.value)}`
)
const { authState } = useAuth()
const accepting = ref(false)
const accepted = ref(false)
const acceptedSlug = ref('')
const actionFailure = ref('')
const {
  data: invitation,
  pending,
  error,
} = await useFetch<{
  ok: true
  memberName: string
  expiresAt: string
}>(endpoint)
const failure = computed(
  () =>
    actionFailure.value ||
    String(
      error.value?.data?.statusMessage || error.value?.message || ''
    ).trim()
)
const authTo = computed(
  () => `/auth?redirect=${encodeURIComponent(route.fullPath)}`
)
const memberTo = computed(
  () =>
    `/console/kitchen/team#${acceptedSlug.value || normalizeSlug(invitation.value?.memberName)}`
)

async function acceptInvitation() {
  if (accepting.value) return
  accepting.value = true
  actionFailure.value = ''
  try {
    const user = await useRequireUser()
    const authToken = await user.getIdToken()
    const result = await $fetch<{
      ok: true
      memberName: string
      memberSlug: string
    }>(endpoint.value, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    })
    acceptedSlug.value = result.memberSlug
    accepted.value = true
  } catch (cause) {
    const error = cause as {
      data?: { statusMessage?: string }
      message?: string
    }
    actionFailure.value =
      error.data?.statusMessage ||
      error.message ||
      'Invitation could not be accepted.'
  } finally {
    accepting.value = false
  }
}
</script>
