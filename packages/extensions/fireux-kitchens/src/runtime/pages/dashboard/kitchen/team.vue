<template>
  <UDashboardPanel id="dashboard-kitchen-team">
    <template #header>
      <LayoutsDashboardNavbar title="Kitchen Team" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span> · Team members:
          <span class="font-medium">{{ teamMembers.length }}</span>
        </div>

        <UCard v-if="teamMembers.length">
          <div class="space-y-3">
            <div
              v-for="member in teamMembers"
              :key="member.id || member.name"
              class="rounded border border-default p-3"
            >
              <div class="flex flex-wrap items-center gap-2">
                <div class="font-medium">{{ member.name }}</div>
                <UBadge v-if="member.isLead" size="xs" variant="soft" color="success">
                  Lead
                </UBadge>
                <UBadge v-if="member.role" size="xs" variant="soft" color="neutral">
                  {{ member.role }}
                </UBadge>
                <UBadge v-if="member.station" size="xs" variant="soft" color="neutral">
                  {{ member.station }}
                </UBadge>
              </div>
              <div class="mt-1 text-xs text-dimmed">
                {{ member.email || 'no-email' }} · {{ member.phone || 'no-phone' }}
              </div>
              <div v-if="member.tags.length" class="mt-2 flex flex-wrap gap-1">
                <UBadge
                  v-for="tag in member.tags"
                  :key="tag"
                  size="xs"
                  variant="soft"
                  color="neutral"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No team members loaded"
          description="No team members found for this kitchen context."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-team',
    label: 'Team',
    icon: 'i-lucide-users',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const teamMembers = computed(() =>
  (runtime.data.value.teamMembers ?? []).map((member: any) => ({
    id: String(member?.id || '').trim(),
    kitchenId: String(member?.kitchen_id || '').trim(),
    name: String(member?.name || 'Unnamed').trim(),
    role: String(member?.role || '').trim(),
    station: String(member?.station || '').trim(),
    isLead: Boolean(member?.is_lead),
    email: String(member?.contact?.email || '').trim(),
    phone: String(member?.contact?.phone || '').trim(),
    tags: Array.isArray(member?.tags)
      ? member.tags.map((tag: unknown) => String(tag || '').trim()).filter(Boolean)
      : [],
  }))
)
</script>
