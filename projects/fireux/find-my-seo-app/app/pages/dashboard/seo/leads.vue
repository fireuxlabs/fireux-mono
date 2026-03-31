<template>
  <UDashboardPanel>
    <template #header>
      <LayoutsConsoleNavbar title="Leads" />
    </template>

    <template #body>
      <div class="space-y-4">
        <UCard v-for="lead in leads" :key="lead.id">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-lg font-semibold">{{ lead.companyName }}</p>
                <UBadge variant="soft">{{ lead.status }}</UBadge>
                <UBadge variant="soft">{{ lead.deliveryState }}</UBadge>
              </div>
              <p class="text-sm text-dimmed">
                For {{ lead.providerDisplayName }} · {{ lead.budgetRange }} · {{ lead.timeline }}
              </p>
              <p class="text-sm text-dimmed">{{ lead.contactName }} · {{ lead.contactEmail }}</p>
              <p class="text-sm leading-6 text-toned">{{ lead.projectSummary }}</p>
            </div>
            <div class="flex gap-3">
              <UButton variant="soft" @click="updateLeadStatus(lead.id, 'contacted')">Mark contacted</UButton>
              <UButton variant="ghost" @click="updateLeadStatus(lead.id, 'closed')">Close</UButton>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
})

const { leads, updateLeadStatus } = useFindMySeoLeads()
</script>
