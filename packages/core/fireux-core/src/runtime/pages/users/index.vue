<!-- packages/tenants/fireux-misebox/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <!-- Current (whatever exists: core/app) -->
      <UCard v-if="currentUser">
        <h3 class="mb-3">Your Profile</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <OrganismsUserCardsPill :user="currentUser" />
          <OrganismsUserCardsProfile :user="currentUser" />
        </div>
      </UCard>

      <!-- CTA when missing (global OR app overlay) -->
      <div v-if="showCreate">
        <UPageSection>
          <UPageCTA
            :title="ctaMessage || 'Complete your user profile to continue.'"
            variant="soft"
          >
            <template #links>
              <UButton
                size="lg"
                color="primary"
                :label="primaryLabel"
                :loading="ensuring"
                :disabled="ensuring"
                @click="onEnsure"
              />
            </template>
          </UPageCTA>
        </UPageSection>
      </div>

      <!-- All Users (role-aware: app in tenant, core otherwise) -->
      <UCard>
        <div class="flex items-center justify-between mb-3">
          <h3>
            All Users
            <span v-if="hasLocal">(App)</span>
            <span v-else>(Core)</span>
            ({{ usersList.length }})
          </h3>
          <div class="flex items-center gap-2">
            <span class="opacity-70 text-sm">Showing: {{ showing }}</span>
            <UButton
              v-if="hasLocal && !hasGlobalLoaded"
              size="xs"
              variant="ghost"
              @click="fetchGlobal"
            >
              Load global
            </UButton>
          </div>
        </div>

        <div
          v-if="usersList.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <OrganismsUserCardsCell
            v-for="u in usersList"
            :key="u.id"
            :user="u"
            class="cursor-default"
          />
        </div>
        <p v-else class="opacity-70">No users found.</p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from '../../composables/firestore/users/useUser'

// Unified user + collections + ensure/delete helpers
const {
  user,
  collection,
  ensureUser,
  ctaMessage,
  hasCoreProfile: hasCoreUserProfile,
  hasAppProfile: hasAppUserProfile,
} = useUser()

/** CTA visibility: show when missing global OR (tenant) app overlay.
 *  In global env hasAppUserProfile is undefined → treat as satisfied.
 */
const showCreate = computed(() => {
  const hasCore = hasCoreUserProfile.value
  const hasApp = hasAppUserProfile?.value ?? true
  return !(hasCore && hasApp)
})
const primaryLabel = computed(() =>
  hasCoreUserProfile.value ? 'Add to this app' : 'Create User'
)

// CTA action (guarded)
const ensuring = ref(false)
async function onEnsure() {
  if (ensuring.value) return
  ensuring.value = true
  try {
    await ensureUser()
  } finally {
    ensuring.value = false
  }
}

/** Current (already flattened by useUser) */
const currentUser = computed(() => user.value)

/** List plumbing (aligns with ProfileRoot behavior) */
const hasLocal = computed(() => Boolean(collection.local))
const hasGlobalLoaded = computed(() => Boolean(collection.global?.value))
const showing = computed<'local' | 'global'>(() =>
  hasLocal.value ? 'local' : 'global'
)

const usersList = computed<any[]>(
  () =>
    (collection.local?.value as any[]) ??
    (collection.global?.value as any[]) ??
    []
)

function fetchGlobal() {
  collection.fetchGlobal?.()
}
</script>
