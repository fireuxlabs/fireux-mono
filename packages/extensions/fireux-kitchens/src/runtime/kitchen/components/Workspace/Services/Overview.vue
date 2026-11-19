<template>
  <WorkspaceKitchenNavigationChild
    orientation="horizontal"
    variant="soft"
    nav-key="workspace-kitchen-menu-group"
    child-key="services"
    link-area="title"
  >
    <div aria-label="Services summary">
      <p v-if="pending" role="status">Loading services…</p>
      <p v-else-if="failed" role="alert">Services could not be loaded.</p>
      <dl v-else-if="rows.length">
        <div v-for="row in rows" :key="row.key">
          <dt>
            <NuxtLink :to="row.to">{{ row.name }}</NuxtLink>
          </dt>
          <dd>
            <UBadge :color="row.badgeColor" variant="soft">
              <NuxtLink
                v-if="row.issues.length"
                :to="row.to"
                :aria-label="row.setupLabel"
                >{{ row.badgeLabel }}</NuxtLink
              >
              <template v-else>{{ row.badgeLabel }}</template>
            </UBadge>
          </dd>
        </div>
      </dl>
      <p v-else>No services enabled.</p>
    </div>
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useKitchenWorkspaceMenuServicesOverview } from './useOverview'

const { rows, pending, failed } = useKitchenWorkspaceMenuServicesOverview()
</script>
