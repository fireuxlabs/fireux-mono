<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/[id].vue -->
<template>
  <div v-if="currentUser" class="space-y-6">
    <MoleculesPill v-bind="toPill()" />
    <OrganismsUserCardsProfile :user="currentUser" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUserFetch } from '../../composables/firestore/core/user/main/useUserFetch'
import { useUserComputed } from '../../composables/firestore/core/user/main/useUserComputed'
import { useUserInterface } from '../../composables/firestore/core/user/main/useUserInterface'

const route = useRoute()
const id = String(route.params.id ?? '')

const { user } = useUserFetch(id)
const { currentUser } = useUserComputed(user)
const { toPill } = useUserInterface(user)
</script>
