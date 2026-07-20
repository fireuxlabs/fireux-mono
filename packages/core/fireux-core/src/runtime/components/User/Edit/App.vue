<!-- FILE: packages/core/fireux-core/src/runtime/components/User/Edit/App.vue -->
<template>
  <section class="space-y-2">
    <p class="text-xs font-semibold uppercase tracking-wide text-toned">
      App access
    </p>

    <ClientOnly>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-semibold">App Membership</h3>
                <p class="text-xs text-muted">
                  App-specific access and entitlement derived from the current app context.
                </p>
              </div>
            </div>
          </template>

          <div v-if="overlay" class="space-y-4">
            <div class="flex items-center gap-3">
              <UBadge size="sm" color="primary" variant="soft">
                {{ overlay.role === 'admin' ? 'Admin' : 'Member' }}
              </UBadge>
              <UBadge
                size="sm"
                :color="isAppPremium ? 'warning' : 'neutral'"
                variant="soft"
              >
                {{ isAppPremium ? 'Premium' : 'Standard' }}
              </UBadge>
              <span class="text-sm text-muted">
                Access granted within this app
              </span>
            </div>

            <div class="text-sm text-toned">
              <p>
                Roles and entitlements are managed from the app member administration surface.
              </p>
            </div>
          </div>
          <div v-else class="text-sm text-muted">
            <p>No tenant overlay detected for this user.</p>
          </div>

        </UCard>
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserRefs } from '../../../composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import type { User } from '../../../models/core/user.model'

const props = defineProps<{ user: User | null; userRefs?: UserRefs }>()

const { appUser } = useUser()

const overlay = computed(() =>
  props.userRefs?.appUser?.value ?? appUser.value ?? null
)

const isAppPremium = computed(() => overlay.value?.is_premium === true)
</script>
