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
                  Tenant-specific access derived from the current app context.
                </p>
              </div>
            </div>
          </template>

          <div v-if="overlay" class="space-y-4">
            <div class="flex items-center gap-3">
              <UBadge size="sm" color="primary" variant="soft">
                {{ overlay.role === 'admin' ? 'Admin' : 'Member' }}
              </UBadge>
              <span class="text-sm text-gray-500">
                Role granted within this tenant
              </span>
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
              Role (local prototype):
              <strong>{{ rolePreview }}</strong>
            </span>
            <UButton size="xs" variant="soft" @click="toggleRolePreview">
              Toggle role (hello ↔ world)
            </UButton>
          </div>
        </UCard>
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import { useUser } from '../../../../composables/firestore/core/user/useUser.ts'

const props = defineProps<{ user: User | null }>()

const { appUser } = useUser()

const overlay = computed(() => appUser.value ?? null)
const rolePreview = ref<'hello' | 'world'>('hello')
const toggleRolePreview = () => {
  rolePreview.value = rolePreview.value === 'hello' ? 'world' : 'hello'
}
</script>
