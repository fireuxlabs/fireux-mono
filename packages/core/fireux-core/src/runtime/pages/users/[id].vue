<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/[id].vue -->
<template>
  <div v-if="user" class="space-y-6">
    <MoleculesPill v-bind="pillProps(user)" />
    <OrganismsUserCardsProfile :user="user" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserFetch } from '../../composables/firestore/core/user/main/useUserFetch'
import { useUserComputed } from '../../composables/firestore/core/user/main/useUserComputed'

const route = useRoute()
const id = String(route.params.id ?? '')

const { user: fetchedUser } = useUserFetch(id)
const { pillProps } = useUserComputed(fetchedUser)

const user = computed(() => fetchedUser.value ?? null)
</script>
