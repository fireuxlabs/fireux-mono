<template>
  <UDashboardPanel id="console-kitchen-team">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Team" />
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
                <UAvatar
                  :src="member.avatarUrl || undefined"
                  :alt="member.name"
                  size="sm"
                  icon="i-lucide-user"
                />
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
                {{ member.phone || 'no-phone' }}
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
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-team',
    label: 'Team',
    icon: 'i-lucide-users',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const teamAvatarPlaceholder = (seed: string) =>
  `https://i.pravatar.cc/256?u=${encodeURIComponent(`fireux-kitchen-team-${seed || 'member'}`)}`
const teamMembers = computed(() =>
  (runtime.data.value.teamMembers ?? []).map((member: any) => {
    const id = String(member?.id || '').trim()
    const name = String(member?.name || 'Unnamed').trim()
    return {
      id,
      kitchenId: String(member?.kitchen_id || '').trim(),
      name,
      avatarUrl:
        String(member?.avatar_url || '').trim() || teamAvatarPlaceholder(id || name),
      role: String(member?.role || '').trim(),
      station: String(member?.station || '').trim(),
      isLead: Boolean(member?.is_lead),
      phone: String(member?.contact?.phone || '').trim(),
      tags: Array.isArray(member?.tags)
        ? member.tags.map((tag: unknown) => String(tag || '').trim()).filter(Boolean)
        : [],
    }
  })
)
</script>
