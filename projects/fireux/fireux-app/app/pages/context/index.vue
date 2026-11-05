<template>
  <UPage>
    <UPageHeader
      headline="FireUX"
      title="Context"
      :description="context.summary"
    />

    <UPageBody>
      <UPageSection title="What we are building">
        <p>{{ context.mission.intent }}</p>
        <p>{{ context.mission.whiteLabel }}</p>
        <p>{{ context.mission.example }}</p>
      </UPageSection>

      <UPageSection title="The FireUX structure">
        <UPageGrid>
          <UCard v-for="(meaning, term) in context.structure" :key="term">
            <template #header>
              <h3 class="platform-context__term">{{ term }}</h3>
            </template>
            <p>{{ meaning }}</p>
          </UCard>
        </UPageGrid>
      </UPageSection>

      <UPageSection title="Using this context">
        <p>{{ context.consumption.purpose }}</p>
        <p>{{ context.consumption.boundary }}</p>
        <UButton :href="context.consumption.endpoint" variant="soft">
          Read public context JSON
        </UButton>
        <p class="platform-context__note">
          The JSON includes a schema version and content revision. Consumers
          choose when to read it; current records and available tools remain
          authoritative.
        </p>
      </UPageSection>

      <UPageSection
        title="Research an industry"
        description="Use the shared method to turn evidence into ranked capability proposals and compare them with current implementation."
      >
        <UButton to="/context/research" variant="soft">
          Industry and Capability Research
        </UButton>
      </UPageSection>

      <UButton to="/product" variant="link">Explore FireUX</UButton>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { readPlatformContext } from '../../../shared/platform-context'

const context = readPlatformContext()

definePageMeta({ layout: 'landing' })
useSeoMeta({ title: 'FireUX context', description: context.summary })
</script>

<style scoped>
.platform-context__term {
  text-transform: capitalize;
}

.platform-context__note {
  color: var(--ui-text-muted);
  font-size: 0.875rem;
}
</style>
