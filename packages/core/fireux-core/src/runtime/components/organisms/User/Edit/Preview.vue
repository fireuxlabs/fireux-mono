<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Edit/Preview.vue -->
<template>
  <ClientOnly>
    <section class="space-y-4">
      <UCard v-if="isLoading">
        <p class="fx-preview__fallback">Loading user preview…</p>
      </UCard>

      <UCard v-else-if="hasPreview" class="space-y-6">
        <header class="fx-preview__header">
          <p class="fx-preview__eyebrow">Directory preview</p>
          <p class="fx-preview__copy">
            This is how your public user profile renders across FireUX.
          </p>
        </header>

        <OrganismsUserCardsPill v-if="pill" :user="pill" />
      </UCard>

      <UCard v-else>
        <p class="fx-preview__fallback">User preview unavailable.</p>
      </UCard>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '../../../../composables/firestore/core/user/useUser.ts'

const { currentUser, pillProps, isLoading } = useUser()

const user = computed(() => currentUser.value ?? null)
const pill = computed(() => pillProps(user.value ?? null))

const hasPreview = computed(() => Boolean(pill.value))
</script>

<style scoped>
.fx-preview__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fx-preview__eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.6);
}

.fx-preview__copy {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: rgba(15, 23, 42, 0.85);
}

.fx-preview__fallback {
  margin: 0;
  padding: 1.25rem 0;
  text-align: center;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.6);
}
</style>
