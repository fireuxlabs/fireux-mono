<template>
  <UDashboardPanel id="ignition-reconciliation">
    <template #header
      ><LayoutsWorkspaceNavbar title="Ignition reconciliation"
    /></template>
    <template #body>
      <div class="mx-auto grid w-full max-w-5xl gap-6">
        <UButton
          to="/workspace/project/ignitions"
          label="Ignition requests"
          icon="i-lucide-arrow-left"
          variant="link"
        />
        <UButton
          to="/workspace/project/industry-comparison"
          label="Compare industries like for like"
          icon="i-lucide-columns-2"
          color="neutral"
          variant="soft"
        />
        <p class="text-muted">
          Use Misebox’s build as evidence for improving the reusable Ignition
          process. Compare business requirements first, then inspect
          implementation decisions.
        </p>
        <UAlert
          title="Independent proposal not supplied yet"
          description="This is a reference case, not proof that Ignition has generated another app."
          color="neutral"
          icon="i-lucide-info"
        />
        <UCard
          ><h2 class="text-lg font-semibold">The business brief</h2>
          <p class="mt-2">{{ brief.outcome }}</p>
          <p class="mt-2 text-sm text-muted">
            {{ brief.actors.join(' · ') }}
          </p></UCard
        >
        <UCard v-for="item in report.coverage" :key="item.id">
          <h2 class="font-semibold">{{ item.need }}</h2>
          <p class="mt-2 text-sm text-muted">{{ item.acceptance }}</p>
          <p class="mt-3 text-sm">
            Reference {{ item.observed.length ? 'mapped' : 'not mapped' }} ·
            independent proposal pending ·
            {{
              item.referenceJourneyProved
                ? 'reference journey proved'
                : 'complete journey unproved'
            }}
          </p>
          <MoleculesDisclosurePanel
            title="Reference implementation"
            :default-open="false"
          >
            <ul class="mt-3 space-y-2 text-sm">
              <li v-for="element in item.observed" :key="element.id">
                <strong>{{ element.id }}</strong> · {{ element.role }} ·
                {{ element.owner }}
                <ul class="mt-1 pl-4 text-muted">
                  <li v-for="path in element.sourcePaths" :key="path">
                    {{ path }}
                  </li>
                </ul>
              </li>
            </ul>
          </MoleculesDisclosurePanel>
        </UCard>
        <UCard
          ><h2 class="text-lg font-semibold">What the build taught us</h2>
          <ul class="mt-3 space-y-4">
            <li v-for="learning in report.learnings" :key="learning.decision">
              <h3 class="font-semibold">{{ learning.decision }}</h3>
              <p class="mt-1 text-sm text-muted">{{ learning.reason }}</p>
            </li>
          </ul></UCard
        >
        <UCard
          ><h2 class="text-lg font-semibold">The Ignition loop</h2>
          <ol class="mt-3 list-decimal space-y-3 pl-5">
            <li v-for="step in ignitionMethod" :key="step.id">
              <h3 class="font-semibold">{{ step.title }}</h3>
              <p class="mt-1 text-sm text-muted">{{ step.instruction }}</p>
            </li>
          </ol></UCard
        >
        <p class="text-sm text-muted">{{ report.boundary }}</p>
      </div>
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { reconcileIgnition } from 'fireux-ignite/runtime/utils/reconcile-ignition'
import { ignitionMethod } from 'fireux-ignite/runtime/utils/ignition-method'
import {
  collectionOrderingBrief as brief,
  miseboxReference,
} from '../../../ignition/misebox-reference'
const report = reconcileIgnition(brief, null, miseboxReference)
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: false,
  roles: ['admin'],
  visibility: { ecosystems: ['fireux'] },
  nav: { hidden: true },
})
</script>
