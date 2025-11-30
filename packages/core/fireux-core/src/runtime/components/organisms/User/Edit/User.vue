<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Edit/User.vue -->
<template>
  <section class="space-y-4">
    <OrganismsUserEditCore :user="user" />
    <OrganismsUserEditApp v-if="showTenantForm" :user="user" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

const props = defineProps<{
  user: User | null
  isTenant?: boolean
}>()

const user = computed(() => props.user ?? null)
const showTenantForm = computed(() => !!user.value && props.isTenant)
</script>
