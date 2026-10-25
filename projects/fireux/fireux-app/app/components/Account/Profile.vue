<template>
  <div class="mx-auto flex w-full max-w-xl flex-col gap-6">
    <FireStateCard
      v-if="coreOutcome === 'idle' || coreOutcome === 'pending'"
      entity="account"
      kind="document"
      loading
    />
    <FireStateCard
      v-else-if="coreOutcome === 'error' || coreError"
      entity="account"
      kind="document"
      state="error"
    />
    <FireStateCard
      v-else-if="coreOutcome === 'empty'"
      entity="account"
      kind="document"
      state="empty"
    >
      <template #actions>
        <UButton
          to="/users/create?redirect=%2Fdashboard%2Fuser-profile"
          label="Complete account setup"
        />
      </template>
    </FireStateCard>
    <UPageCard v-else-if="coreUser" title="Your account" variant="subtle">
      <ClientOnly>
        <AvatarEditor :key="coreUser.id" :user="coreUser" />
      </ClientOnly>
      <USeparator />
      <div>
        <p class="text-sm font-medium text-highlighted">Sign-in email</p>
        <p class="mt-1 break-words text-sm text-muted">
          {{ currentUser?.email || 'Not available' }}
        </p>
      </div>
    </UPageCard>
    <UPageCard variant="subtle">
      <UButton
        to="/dashboard/connections"
        label="Connected ecosystems"
        icon="i-lucide-link"
        color="neutral"
        variant="soft"
      />
      <UButton
        to="/dashboard/settings"
        label="Settings"
        icon="i-lucide-settings"
        color="neutral"
        variant="ghost"
      />
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import AvatarEditor from 'fireux-core/runtime/user/components/Edit/Avatar.vue'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
const { coreUser, coreOutcome, coreError } = useUserSession()
const { currentUser } = useAuth()
</script>
