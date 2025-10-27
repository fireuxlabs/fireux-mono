<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/[id].vue -->
<template>
  <div v-if="user" class="space-y-6">
    <MoleculesPill v-bind="pillProps(user)" />
    <OrganismsUserCardsProfile :user="user" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUser } from '../../composables/firestore/core/user/useUser'

const route = useRoute()
const id = String(route.params.id ?? '')

const { fetchedUser, pillProps } = useUser()
const { user } = fetchedUser(id)
</script>