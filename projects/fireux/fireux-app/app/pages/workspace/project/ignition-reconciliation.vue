<template>
  <div class="pagebody">
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
    <p class="fx-type-body">
      Use Misebox’s build as evidence for improving the reusable Ignition
      process. Compare business requirements first, then inspect implementation
      decisions.
    </p>
    <UAlert
      title="Independent proposal not supplied yet"
      description="This is a reference case, not proof that Ignition has generated another app."
      color="neutral"
      icon="i-lucide-info"
    />
    <UCard
      ><h2 class="fx-type-section-title">The business brief</h2>
      <p>{{ brief.outcome }}</p>
      <p class="fx-type-caption">
        {{ brief.actors.join(' · ') }}
      </p></UCard
    >
    <UCard>
      <h2 class="fx-type-section-title">Search plan</h2>
      <p>{{ searchStatusLabels[report.search.status] }}</p>
      <ul v-if="report.search.findings.length" class="fx-list-stack">
        <li v-for="finding in report.search.findings" :key="finding">
          {{ finding }}
        </li>
      </ul>
      <p class="fx-type-caption">
        This reviews declared policy. Deployed pages, indexation and search
        performance need separate evidence.
      </p>
    </UCard>
    <UCard v-for="item in report.coverage" :key="item.id">
      <h2 class="fx-type-section-title">{{ item.need }}</h2>
      <p class="fx-type-caption">{{ item.acceptance }}</p>
      <p class="fx-type-caption">
        Reference {{ item.observed.length ? 'mapped' : 'not mapped' }} ·
        independent proposal pending ·
        {{
          item.referenceJourneyProved
            ? 'reference journey proved'
            : 'complete journey unproved'
        }}
      </p>
      <FireDisclosurePanel
        title="Reference implementation"
        :default-open="false"
      >
        <ul class="fx-list-stack">
          <li v-for="element in item.observed" :key="element.id">
            <strong>{{ element.id }}</strong> · {{ element.role }} ·
            {{ element.owner }}
            <ul>
              <li v-for="path in element.sourcePaths" :key="path">
                {{ path }}
              </li>
            </ul>
          </li>
        </ul>
      </FireDisclosurePanel>
    </UCard>
    <UCard
      ><h2 class="fx-type-section-title">What the build taught us</h2>
      <ul class="fx-list-stack">
        <li v-for="learning in report.learnings" :key="learning.decision">
          <h3 class="fx-type-card-heading">{{ learning.decision }}</h3>
          <p class="fx-type-caption">{{ learning.reason }}</p>
        </li>
      </ul></UCard
    >
    <UCard
      ><h2 class="fx-type-section-title">The Ignition loop</h2>
      <ol class="fx-list-stack">
        <li v-for="step in ignitionMethod" :key="step.id">
          <h3 class="fx-type-card-heading">{{ step.title }}</h3>
          <p class="fx-type-caption">{{ step.instruction }}</p>
        </li>
      </ol></UCard
    >
    <p class="fx-type-caption">{{ report.boundary }}</p>
  </div>
</template>
<script setup lang="ts">
import { reconcileIgnition } from 'fireux-ignite/runtime/utils/reconcile-ignition'
import { ignitionMethod } from 'fireux-ignite/runtime/utils/ignition-method'
import {
  collectionOrderingBrief as brief,
  miseboxReference,
} from '../../../ignition/misebox-reference'
const report = reconcileIgnition(brief, null, miseboxReference)
const searchStatusLabels = {
  missing: 'Missing',
  'needs-review': 'Needs review',
  declared: 'Declared',
} satisfies Record<typeof report.search.status, string>
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: false,
  roles: ['admin'],
  visibility: { ecosystems: ['fireux'] },
  nav: { hidden: true },
})
</script>
