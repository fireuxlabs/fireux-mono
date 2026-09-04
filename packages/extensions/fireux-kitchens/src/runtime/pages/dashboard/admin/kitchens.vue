<template>
  <UPage>
    <UPageHeader
      title="Kitchens"
      description="Provision a Place-backed Kitchen for an App member, or curate public Kitchen surfaces."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <template #header>
          <div>
            <h2 class="font-semibold text-highlighted">Create for a member</h2>
            <p class="mt-1 text-sm text-muted">
              You remain the authenticated administrator. The selected member
              becomes the Kitchen owner.
            </p>
          </div>
        </template>

        <USelect
          v-model="ownerUserId"
          :items="memberOptions"
          value-key="value"
          label-key="label"
          placeholder="Choose an App member"
          :loading="pending"
          class="w-full max-w-md"
        />
      </UCard>

      <KitchenAdminProvision
        v-if="selectedOwner"
        :key="ownerUserId"
        :user="selectedOwner"
        return-to="/dashboard/admin/kitchens"
        cancel-to="/dashboard/admin/kitchens"
        @created="onProvisioned"
      />

      <DashboardAdminDomainCurationPanel
        domain="kitchen"
        title="Featured Kitchens"
        description="Add comma-separated kitchen slugs to feature on public kitchen surfaces."
        placeholder="la-tapberne, luna-piccante"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppUsers } from 'fireux-core/runtime/app/composables/useAppUsers'

const ownerUserId = ref('')
const { memberships, pending, refresh } = useAppUsers()
const memberOptions = computed(() =>
  memberships.value.map((member) => {
    const name = member.user?.display_name || member.user?.handle || member.id
    const handle = member.user?.handle ? ` · @${member.user.handle}` : ''
    return {
      label: `${name}${handle} · ${member.subscription}`,
      value: member.id,
    }
  })
)
const selectedOwner = computed(() => {
  const member = memberships.value.find((item) => item.id === ownerUserId.value)
  if (!member) return null
  return {
    id: member.id,
    handle: member.user?.handle || '',
    display_name:
      member.user?.display_name || member.user?.handle || 'App member',
  }
})

async function onProvisioned() {
  ownerUserId.value = ''
  await refresh()
}

definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'kitchens',
    domain: 'kitchens',
    label: 'Kitchens',
    description:
      'Provision member Kitchens and curate public Kitchen surfaces.',
    icon: 'i-lucide-chef-hat',
    order: 100,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
