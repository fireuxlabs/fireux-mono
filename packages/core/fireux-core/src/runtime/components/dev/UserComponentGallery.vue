<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          User component variants
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Resolved with useUserInterface to match runtime context.
        </p>
      </div>
      <UBadge variant="soft" color="info">
        {{ hasUser ? 'Previewing live data' : 'Waiting for user data' }}
      </UBadge>
    </header>

    <p v-if="!hasUser" class="text-sm text-gray-500 dark:text-gray-400">
      Load or select a user to preview pill and cell variants.
    </p>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <UCard class="space-y-3">
        <template #header>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Pill
          </h3>
        </template>
        <OrganismsUserCardsPill v-if="pill" :user="pill" />
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Derived pill props showing badges + runtime admin state.
        </p>
      </UCard>

      <UCard class="space-y-3">
        <template #header>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Cell
          </h3>
        </template>
        <OrganismsUserCardsCell v-if="cell" :user="cell" />
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Cell variant surfaces handles, emails, and membership metadata.
        </p>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import { useUserInterface } from '../../composables/fireux/firestore/core/user/state/useUserInterface.ts'

defineOptions({ name: 'DevUserComponentGallery' })

interface Props {
  user?: User | null
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
})

const { pillProps, cellProps } = useUserInterface()

const hasUser = computed(() => Boolean(props.user))
const pill = computed(() => (props.user ? pillProps(props.user) : null))
const cell = computed(() => (props.user ? cellProps(props.user) : null))
</script>
