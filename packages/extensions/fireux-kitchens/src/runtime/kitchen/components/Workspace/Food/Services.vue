<template>
  <WorkspaceKitchenNavigationChild
    nav-key="workspace-kitchen-food"
    child-key="services"
  >
    <div aria-label="Services summary">
      <p v-if="pending" role="status" class="text-sm text-muted">
        Loading services…
      </p>
      <p v-else-if="failed" role="alert" class="text-sm text-muted">
        Services could not be loaded.
      </p>
      <dl v-else-if="rows.length" class="grid gap-x-8 gap-y-2 sm:grid-cols-2">
        <div
          v-for="row in rows"
          :key="row.key"
          class="flex flex-wrap justify-between gap-x-4 text-sm"
        >
          <dt>
            <NuxtLink
              :to="row.to"
              class="relative z-10 font-medium hover:underline focus-visible:underline"
              >{{ row.name }}</NuxtLink
            >
          </dt>
          <dd
            :class="
              row.open
                ? 'text-success'
                : row.needsSetup
                  ? 'text-warning'
                  : 'text-muted'
            "
          >
            <NuxtLink
              v-if="row.issues.length"
              :to="row.to"
              :aria-label="`Configure ${row.name}: ${row.issues.join(' · ')}`"
              class="relative z-10 hover:underline focus-visible:underline"
              >{{ row.issues.join(' · ') }}</NuxtLink
            >
            <template v-else>{{ row.label }}</template>
          </dd>
        </div>
      </dl>
      <p v-else class="text-sm text-muted">No services enabled.</p>
    </div>
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useFoodAndDrinkIndexContext } from '../../../composables/workspace/food/useFoodAndDrinkIndexContext'
const { rows, pending, failed } = useFoodAndDrinkIndexContext()
</script>
