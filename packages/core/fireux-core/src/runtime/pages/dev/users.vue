<template>
  <div>
    <!-- Summary (read-only) -->
    <UCard>
      <template #header>
        <h1>👥 Users (Dev)</h1>
      </template>

      <div
        class="grid"
        style="display: grid; gap: 12px; grid-template-columns: 1fr"
      >
        <div>
          <h2>Status</h2>
          <ul>
            <li>hasCoreProfile: {{ hasCoreProfile }}</li>
            <li v-if="hasAppProfile !== undefined">
              hasAppProfile: {{ hasAppProfile }}
            </li>
            <li>isAdmin: {{ isAdmin }}</li>
            <li>displayName: {{ displayName || '—' }}</li>
            <li>initials: {{ initials || '—' }}</li>
          </ul>
        </div>

        <USeparator />

        <!-- No actions: Dev pages are read-only; use DevJson for inspection only. -->
      </div>
    </UCard>

    <!-- Current user JSON -->
    <UCard style="margin-top: 16px">
      <DevJson
        :data="user?.value ?? null"
        title="Current User"
        :defaultOpen="true"
      />
    </UCard>

    <!-- Collections overview (read-only) -->
    <div
      style="
        margin-top: 16px;
        display: grid;
        gap: 16px;
        grid-template-columns: 1fr;
      "
    >
      <UCard v-if="isTenant">
        <template #header>
          <h2>Local Collection (apps/{{ appId }}/users)</h2>
        </template>
        <p>Total: {{ localCount }}</p>
        <DevJson :data="localFirst" title="First Local (up to 5)" />
      </UCard>

      <UCard>
        <template #header>
          <h2>Global Collection (core-users)</h2>
        </template>
        <p>Total: {{ globalCount }}</p>
        <DevJson :data="globalFirst" title="First Global (up to 5)" />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Users',
  layout: 'dev',
})

import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/FireUXConfig'
import { useUser } from '../../composables/firestore/user/useUser'


// Unified user API
const {
  user,
  collection,
  hasCoreProfile,
  hasAppProfile,
  isAdmin,
  displayName,
  initials,
} = useUser()

// Env (tenant vs global)
const { role, appId } = useFireUXConfig()
const isTenant = role === 'tenant'

// Collections
const localCount = computed(() => collection.local?.value?.length ?? 0)
const globalCount = computed(() => collection.global?.value?.length ?? 0)

const localFirst = computed(() => (collection.local?.value ?? []).slice(0, 5))
const globalFirst = computed(() => (collection.global?.value ?? []).slice(0, 5))
</script>

<style scoped>
/* Keep styling minimal; rely on UCard + DevJson */
</style>
