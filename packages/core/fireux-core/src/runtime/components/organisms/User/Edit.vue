<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Edit.vue -->
<template>
  <div class="space-y-6">
    <OrganismsUserEditCore :user="user" />
    <OrganismsUserEditApp :user="user" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

const props = defineProps<{ user: User | null }>()

const user = computed(() => props.user ?? null)
</script>
