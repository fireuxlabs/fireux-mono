<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Edit/Preview.vue -->
<template>
  <section class="space-y-4">
    <div v-if="hasCards" class="grid gap-4 sm:grid-cols-2">
      <OrganismsUserCardsPill v-if="pill" :user="pill" />
      <OrganismsUserCardsCell v-if="cell" :user="cell" :to="link" />
    </div>

    <OrganismsUserCardsProfile v-if="user" :user="user" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'

const props = defineProps<{
  user: User | null
  pill: UserCard.Pill | null
  cell: UserCard.Cell | null
  link: string | null
}>()

const user = computed(() => props.user)
const pill = computed(() => props.pill)
const cell = computed(() => props.cell)
const link = computed(() => props.link ?? undefined)

const hasCards = computed(() => !!pill.value || !!cell.value)
</script>
