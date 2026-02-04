<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Professional card surfaces</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Pill, cell, and preview variants.</p>
      </div>
    </template>

    <div class="space-y-4">
      <OrganismsProfilesProfessionalCardsPill v-bind="pill" />
      <OrganismsProfilesProfessionalCardsCell v-bind="cell" />
      <OrganismsProfilesProfessionalCardsPreview v-bind="preview" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevProfessionalDummy' })

const base = {
  to: '',
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  secondaryAvatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
  displayName: 'Ava Laurent',
  title: 'Senior Sous Chef',
  bioShort: 'Seasoned fine-dining chef with alpine and coastal experience.',
  locationsCsv: 'St. Moritz, Zermatt',
}

const pill = {
  to: base.to,
  avatarUrl: base.avatarUrl,
  secondaryAvatarUrl: base.secondaryAvatarUrl,
  displayName: base.displayName,
  title: base.title,
}

const cell = {
  to: base.to,
  avatarUrl: base.avatarUrl,
  secondaryAvatarUrl: base.secondaryAvatarUrl,
  displayName: base.displayName,
  title: base.title,
  locationsCsv: base.locationsCsv,
}

const preview = {
  to: base.to,
  avatarUrl: base.avatarUrl,
  secondaryAvatarUrl: base.secondaryAvatarUrl,
  displayName: base.displayName,
  title: base.title,
  bioShort: base.bioShort,
  locationsCsv: base.locationsCsv,
}
</script>
