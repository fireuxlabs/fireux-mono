<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/dev/Job/Dummy.vue -->

<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Job card surfaces</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Pill, preview, cell, and profile variants with a real-looking payload.</p>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Pill: STRICT = image + kitchen name + job title -->
      <JobCardsPill v-bind="pill" />

      <JobCardsPreview
        :image-url="preview.imageUrl"
        :title="preview.title"
        :subtitle="preview.subtitle"
        :badges="preview.badges"
        :prop="preview.prop"
      />

      <JobCardsCell v-bind="cell" />

      <JobCardsProfile :card="profile" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevJobDummy' })

import { dummyJob, dummyJobCardCell, dummyJobUI, dummyKitchenHydrated } from '../../../../../../../../dummy/job.dummy'

// Pill: no fallbacks, no badges, no status, no location_label.
// imageUrl + kitchen name + job title.
const pill = {
  to: '',
  title: dummyJob.title,
  imageUrl: (dummyKitchenHydrated as any).image_url,
  kitchenName: (dummyKitchenHydrated as any).name,
}

// Keep cell as-is for now (it’s already a dev surface)
const cell = dummyJobCardCell

// Preview: keep richer info, but no "Error" fallbacks.
const preview = {
  imageUrl: cell.imageUrl,
  title: dummyJob.title,
  subtitle: cell.subtitle,
  badges: [dummyJobUI.published_label],
  prop: `${dummyJob.pay_currency} ${Number(dummyJob.pay_rate).toFixed(2)}/${dummyJob.pay_unit} · ${dummyJobUI.shifts_count_label}`,
}

// Profile: also no "Error" fallbacks; use real ids.
const profile = {
  id: dummyJob.id,
  to: '',
  imageUrl: '',
  title: dummyJob.title,
  subtitle: dummyJobUI.location.address_line,
  status: dummyJob.status,
  description: dummyJob.description,
  badges: [
    `${dummyJob.pay_currency} ${Number(dummyJob.pay_rate).toFixed(2)}/${dummyJob.pay_unit}`,
    dummyJobUI.published_label,
  ],
  kitchenId: dummyJob.kitchen_id,
  companyId: dummyJob.company_id,
}
</script>