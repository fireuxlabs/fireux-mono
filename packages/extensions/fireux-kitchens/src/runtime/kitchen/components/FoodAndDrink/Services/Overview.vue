<template>
  <WorkspaceKitchenNavigationChild
    orientation="horizontal"
    variant="soft"
    nav-key="workspace-kitchen-food"
    child-key="services"
  >
    <div aria-label="Services summary">
      <p v-if="pending" role="status">Loading services…</p>
      <p v-else-if="failed" role="alert">Services could not be loaded.</p>
      <dl v-else-if="rows.length">
        <div v-for="row in rows" :key="row.key">
          <dt>
            <NuxtLink :to="row.to" class="relative z-10">{{
              row.name
            }}</NuxtLink>
          </dt>
          <dd>
            <UBadge
              :color="
                row.open ? 'success' : row.needsSetup ? 'warning' : 'neutral'
              "
              variant="soft"
            >
              <NuxtLink
                v-if="row.issues.length"
                :to="row.to"
                :aria-label="`Configure ${row.name}: ${row.issues.join(' · ')}`"
                class="relative z-10"
                >{{ row.issues.join(' · ') }}</NuxtLink
              >
              <template v-else>{{ row.label }}</template>
            </UBadge>
          </dd>
        </div>
      </dl>
      <p v-else>No services enabled.</p>
    </div>
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useFoodAndDrinkIndexContext } from '../../../composables/workspace/food/useFoodAndDrinkIndexContext'
const { rows, pending, failed } = useFoodAndDrinkIndexContext()
</script>
