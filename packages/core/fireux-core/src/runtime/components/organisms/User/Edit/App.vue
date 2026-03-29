<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Edit/App.vue -->
<template>
  <section class="space-y-2">
    <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">
      App Properties
    </p>

    <ClientOnly>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-semibold">App Membership</h3>
                <p class="text-xs text-gray-500">
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
              <span class="text-sm text-gray-500">
                Access granted within this app
              </span>
            </div>

            <div class="flex items-center justify-between gap-3">
              <div class="text-xs text-gray-600 space-y-1">
                <p>appUser.role: {{ appUserRole }}</p>
                <p>appUser.is_premium: {{ String(isAppPremium) }}</p>
                <p>
                  core adminOf: {{ props.user?.adminOf?.join(', ') || 'none' }}
                </p>
              </div>
              <USwitch
                :model-value="isAppAdmin"
                :loading="togglingAdmin"
                label="App admin"
                @update:model-value="handleToggleAdmin"
              />
            </div>

            <div class="flex items-center justify-between gap-3">
              <div class="text-xs text-gray-600 space-y-1">
                <p>Premium users can own multiple live console targets.</p>
              </div>
              <USwitch
                :model-value="isAppPremium"
                :loading="togglingPremium"
                label="Premium"
                @update:model-value="handleTogglePremium"
              />
            </div>

            <div class="text-sm text-gray-600">
              <p>
                App overlay updates are managed by tenant administrators.
                Contact an admin to adjust your role.
              </p>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">
            <p>No tenant overlay detected for this user.</p>
          </div>

          <div
            class="flex flex-wrap items-center gap-3 text-sm text-emerald-900"
          >
            <span>
              Premium capability is now a real app-user field.
            </span>
          </div>
        </UCard>
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApp } from '../../../../composables/fireux/firestore/core/app/useApp'
import type { UserRefs } from '../../../../composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from '../../../../composables/fireux/firestore/core/user/useUser'
import type { User } from '../../../../models/core/user.model'

const props = defineProps<{ user: User | null; userRefs?: UserRefs }>()

const { appUser } = useUser()
const { app, setAppUserAdmin, setAppUserPremium } = useApp()

const overlay = computed(() =>
  props.userRefs?.appUser?.value ?? appUser.value ?? null
)

const appAdmins = computed(() =>
  Array.isArray(app.value?.admin_ids)
    ? app.value.admin_ids.filter(
        (id): id is string => typeof id === 'string' && id.length > 0
      )
    : []
)

const appUserRole = computed(() => overlay.value?.role ?? 'user')
const isAppAdmin = computed(() => appUserRole.value === 'admin')
const isAppPremium = computed(() => overlay.value?.is_premium === true)
const togglingAdmin = ref(false)
const togglingPremium = ref(false)

const handleToggleAdmin = async (nextValue: boolean) => {
  if (!props.user?.id) return
  togglingAdmin.value = true
  try {
    console.log('1) toggle-start', {
      makeAdmin: nextValue,
      userId: props.user.id,
    })
    await setAppUserAdmin(props.user.id, nextValue)
    console.log('2) app-user-role-updated')
    console.log('3) app-admin-ids-updated', appAdmins.value)
    console.log('4) core-user-adminOf-updated', props.user.adminOf)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    console.error('Admin toggle failed:', msg)
  } finally {
    togglingAdmin.value = false
  }
}

const handleTogglePremium = async (nextValue: boolean) => {
  if (!props.user?.id) return
  togglingPremium.value = true
  try {
    await setAppUserPremium(props.user.id, nextValue)
    console.log('app-user-premium-updated', {
      userId: props.user.id,
      isPremium: nextValue,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    console.error('Premium toggle failed:', msg)
  } finally {
    togglingPremium.value = false
  }
}
</script>
