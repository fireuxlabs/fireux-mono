<template>
  <FireState
    v-if="outcome === 'pending'"
    entity="properties"
    outcome="pending"
  />
  <UAlert
    v-else-if="outcome === 'error'"
    title="Properties could not be loaded"
    description="Try again to see the latest published properties."
    color="error"
    variant="soft"
    role="alert"
    aria-live="assertive"
  >
    <template #actions>
      <FireCopyError
        message="Properties could not be loaded&#10;Try again to see the latest published properties."
      />
      <UButton label="Try again" variant="soft" @click="refresh()" />
    </template>
  </UAlert>
  <template v-else>
    <PropertyCollection v-if="properties.length" :properties="properties" />
    <UAlert
      v-else
      title="No published properties here yet"
      :description="
        hasMore
          ? 'More results are available to check.'
          : 'Published properties will appear here.'
      "
      color="neutral"
      variant="soft"
      role="status"
      aria-live="polite"
    />
    <div v-if="hasMore">
      <UButton
        label="Show more properties"
        :loading="loadingMore"
        :disabled="loadingMore"
        variant="soft"
        @click="loadMore()"
      />
    </div>
    <UAlert
      v-if="loadMoreError"
      title="More properties could not be loaded"
      description="Try again to continue browsing."
      color="error"
      variant="soft"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <FireCopyError
          message="More properties could not be loaded&#10;Try again to continue browsing."
        />
      </template>
    </UAlert>
  </template>
</template>
<script setup lang="ts">
import { usePropertyDirectory } from '../../composables/usePropertyDirectory'
const {
  properties,
  outcome,
  refresh,
  hasMore,
  loadingMore,
  loadMore,
  loadMoreError,
} = usePropertyDirectory()
</script>
