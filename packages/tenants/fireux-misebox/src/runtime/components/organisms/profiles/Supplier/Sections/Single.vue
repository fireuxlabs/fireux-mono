<template>
  <div class="space-y-6">
    <UCard v-if="coreProfile">
      <template #header>
        <h2>{{ coreUser?.display_name || '-' }}</h2>
      </template>

      <div class="space-y-4">
        <MiseProfilesSupplierCardsPill
          v-if="pill"
          :supplier="pill"
          class="max-w-md"
        />
      </div>
    </UCard>

    <p v-else class="text-sm opacity-70">No supplier profile loaded.</p>
  </div>
</template>

<script setup lang="ts">
import type {
  SupplierProfile,
  SupplierCard,
} from '../../../../../models/profiles/Supplier.model.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

defineProps<{
  coreProfile: SupplierProfile | null | undefined
  appProfile?: Partial<SupplierProfile> | null | undefined
  pill: SupplierCard.Pill | null
}>()

const { coreUser } = useUser()
</script>
