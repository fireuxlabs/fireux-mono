<!-- Concurrent edit — 2026-07-21 16:17 CEST — Module family design: replace entity-card grammar with composition and capability rows. -->
<template>
  <div class="pagebody">
    <UPageGrid>
      <UPageCard title="Reusable capability" description="A source-controlled package with a clear job.">
        <UBadge color="neutral" variant="soft">Module</UBadge>
      </UPageCard>
      <UPageCard title="Added to an app" description="An app chooses the modules it needs.">
        <UBadge color="neutral" variant="soft">App</UBadge>
      </UPageCard>
      <UPageCard title="What it can support">
        <ul class="fx-list-stack">
          <li v-for="surface in supportedSurfaces" :key="surface">
            <UBadge color="neutral" variant="soft">{{ surface }}</UBadge>
          </li>
        </ul>
      </UPageCard>
    </UPageGrid>
    <UPageSection
      title="Capability library"
      :description="`${fireuxExtensionModules.length} reusable FireUX modules.`"
      :links="[{ label: 'How modules work', to: '/modules/learn-more', color: 'neutral', variant: 'soft', icon: 'i-lucide-book-open' }]"
    >
      <UPageSection v-for="group in fireuxExtensionModuleGroups" :key="group.id" :title="group.name" :description="group.description">
        <p class="fx-type-caption">{{ modulesFor(group.id).length }} modules</p>
        <UPageGrid>
          <UPageCard v-for="module in modulesFor(group.id)" :key="module.id" :title="module.name" :description="module.description" :icon="module.icon">
            <code>{{ module.id }}</code>
          </UPageCard>
        </UPageGrid>
      </UPageSection>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
import {
  fireuxExtensionModuleGroups,
  fireuxExtensionModules,
  type FireuxExtensionModuleGroupId,
} from '../../../module-catalogue'

const supportedSurfaces = [
  'Entities',
  'Operations',
  'Tools',
  'Solutions',
] as const

const modulesFor = (groupId: FireuxExtensionModuleGroupId) =>
  fireuxExtensionModules.filter((module) => module.group === groupId)
</script>
