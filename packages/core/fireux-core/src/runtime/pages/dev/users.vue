<template>
  <div class="p-4 space-y-4">
    <h1>Users (dev)</h1>

    <section>
      <h2>Status</h2>
      <ul>
        <li>hasCoreProfile: {{ hasCoreProfile }}</li>
        <li v-if="hasAppProfile !== undefined">hasAppProfile: {{ hasAppProfile }}</li>
        <li>isAdmin: {{ isAdmin }}</li>
        <li>displayName: {{ displayName || '—' }}</li>
        <li>initials: {{ initials || '—' }}</li>
      </ul>
    </section>

    <section>
      <h2>Current user (flattened)</h2>
      <pre>{{ userJson }}</pre>
    </section>

    <section>
      <h2>Collections</h2>
      <ul>
        <li>local (apps/{appId}/users): {{ localCount }}</li>
        <li>global (core-users): {{ globalCount }}</li>
      </ul>

      <details v-if="localCount">
        <summary>First local users (up to 5)</summary>
        <pre>{{ localPreview }}</pre>
      </details>

      <details v-if="globalCount">
        <summary>First global users (up to 5)</summary>
        <pre>{{ globalPreview }}</pre>
      </details>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Users',
  layout: 'dev',
})

import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'

// Pull everything we need from the unified user composable
const {
  user,                    // Ref<User | null>
  collection,              // { local?: Ref<any[]>|null, global?: Ref<any[]>|null }
  hasCoreProfile,          // Computed<boolean>
  hasAppProfile,           // Computed<boolean> | undefined (only in tenant apps)
  isAdmin,                 // Computed<boolean>
  displayName,             // Computed<string>
  initials,                // Computed<string>
} = useUser()

// Pretty JSON helpers
const userJson = computed(() =>
  JSON.stringify(user.value, null, 2)
)

// Collection counts
const localCount = computed(() => collection.local?.value?.length ?? 0)
const globalCount = computed(() => collection.global?.value?.length ?? 0)

// Small previews
const localPreview = computed(() =>
  JSON.stringify((collection.local?.value ?? []).slice(0, 5), null, 2)
)
const globalPreview = computed(() =>
  JSON.stringify((collection.global?.value ?? []).slice(0, 5), null, 2)
)
</script>

<style scoped>
/* intentionally minimal */
</style>