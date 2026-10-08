<template>
  <section class="space-y-4">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-semibold">Portfolio Properties</h2>
          <UBadge
            v-if="outcome === 'ready' || outcome === 'empty'"
            color="neutral"
            variant="soft"
            >{{ properties.length }}</UBadge
          >
        </div>
      </template>
      <p v-if="outcome === 'pending'" role="status" class="text-sm text-muted">
        Loading properties…
      </p>
      <UAlert
        v-else-if="outcome === 'error'"
        color="error"
        title="Properties could not be loaded"
      >
        <template #actions
          ><MoleculesCopyError message="Properties could not be loaded."
        /></template>
      </UAlert>
      <ul v-else-if="outcome === 'ready'" class="divide-y divide-default">
        <li
          v-for="property in properties"
          :key="property.id"
          class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <UAvatar
            :src="property.identity.image_url || undefined"
            :alt="property.identity.name"
            icon="i-lucide-building-2"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium">{{ property.identity.name }}</p>
            <p class="text-xs text-muted">
              {{ property.identity.property_type }} ·
              {{ property.identity.unit_count }} units
            </p>
          </div>
          <UBadge color="neutral" variant="subtle">{{
            property.identity.publication_state
          }}</UBadge>
        </li>
      </ul>
      <p v-else-if="outcome === 'empty'" class="text-sm text-muted">
        No properties in this Portfolio yet.
      </p>
      <p v-else class="text-sm text-muted">
        Select an available Portfolio to view properties.
      </p>
    </UCard>
    <DevDebugPanel
      v-if="isDev"
      title="Portfolio properties"
      scope="workspace"
      object-origin="fetched"
      :objects="{ properties }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioWorkspaceProperties } from '../../../composables/workspace/properties/usePortfolioWorkspaceProperties'
const isDev = import.meta.dev
const { properties, outcome, debug } = usePortfolioWorkspaceProperties()
</script>
