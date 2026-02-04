<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Agent card surfaces</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Pill, cell, and preview variants.</p>
      </div>
    </template>

    <div class="space-y-4">
      <OrganismsProfilesAgentCardsPill v-bind="pill" />
      <OrganismsProfilesAgentCardsCell v-bind="cell" />
      <OrganismsProfilesAgentCardsPreview v-bind="preview" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevAgentDummy' })

const base = {
  to: '',
  avatarUrl: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=240&q=80',
  secondaryAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
  displayName: 'Mila Ortiz',
  tagline: 'Hospitality placements · Alpine & coastal',
  badges: ['Alpine', 'Executive'],
  bioShort: 'Matchmaking kitchens with talent across Europe and the U.S.',
  contactEmail: 'mila@misebox.app',
}

const pill = {
  to: base.to,
  avatarUrl: base.avatarUrl,
  secondaryAvatarUrl: base.secondaryAvatarUrl,
  displayName: base.displayName,
  tagline: base.tagline,
  badges: base.badges,
}

const cell = {
  to: base.to,
  avatarUrl: base.avatarUrl,
  secondaryAvatarUrl: base.secondaryAvatarUrl,
  displayName: base.displayName,
  tagline: base.tagline,
  badges: base.badges,
  bioShort: base.bioShort,
}

const preview = {
  avatarUrl: base.avatarUrl,
  secondaryAvatarUrl: base.secondaryAvatarUrl,
  displayName: base.displayName,
  tagline: base.tagline,
  badges: base.badges,
  bioShort: base.bioShort,
  contactEmail: base.contactEmail,
}
</script>
