<template>
  <div class="page space-y-4">
    <!-- CTA: create or add-to-app -->
    <template v-if="showCreate">
      <UPageCTA :title="ctaTitle" variant="soft">
        <template #links>
          <UButton
            size="lg"
            color="primary"
            :label="primaryLabel"
            @click="onEnsure"
          />
        </template>
      </UPageCTA>
    </template>

    <!-- If profile already exists: show compact current -->
    <template v-else-if="profile">
      <div class="mt-4 space-y-2">
        <OrganismsProfilesChefCardsPill
          class="cursor-pointer"
          :chef="profile"
        />
        <OrganismsProfilesChefCardsCell
          class="cursor-pointer"
          :chef="profile"
        />
      </div>
    </template>

    <!-- All profiles listing via reusable Root -->
    <OrganismsProfileRoot
      :config="chefConfig"
      :filter-fn="filterFn"
      :sort-fn="sortFn"
    >
      <template
        #toolbar="{ showLocal, showGlobal, showing, hasLocal, hasGlobal }"
      >
        <div class="flex flex-wrap items-center gap-2">
          <UInput
            v-model="q"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search chefs…"
            class="min-w-[220px]"
          />
          <USelect
            v-model="sortKey"
            :options="sortOptions"
            class="min-w-[180px]"
          />
          <div
            v-if="hasLocal || hasGlobal"
            class="ml-auto flex items-center gap-1"
          >
            <UBadge :label="`Showing: ${showing}`" variant="soft" />
            <UButton size="sm" variant="ghost" @click="showLocal"
              >Local</UButton
            >
            <UButton size="sm" variant="ghost" @click="showGlobal"
              >Global</UButton
            >
          </div>
        </div>
      </template>
      <template #profile-pill="{ profile, navigate }">
        <OrganismsProfilesChefCardsPill
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-card="{ profile, navigate }">
        <OrganismsProfilesChefCardsProfile
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-item="{ profile, navigate }">
        <OrganismsProfilesChefCardsCell
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>
    </OrganismsProfileRoot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { chefConfig } from '../../models/profiles/Chef.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'

// tenancy
const { tenancyDisplay } = useApp()

// profile
const { profile, ensure } = useProfile(chefConfig)

// CTA logic
const showCreate = computed(() => !profile.value)

const ctaTitle = computed(() =>
  showCreate.value
    ? (chefConfig as any)?.ctaTitle || 'Create your profile'
    : `You're all set`
)

const primaryLabel = computed(() =>
  showCreate.value ? 'Create Chef Profile' : `Add to ${tenancyDisplay} Chefs`
)

// action
async function onEnsure() {
  await ensure()
}

// --------- Toolbar: search + sort ---------
const q = ref('')
const sortKey = ref<'name-asc' | 'name-desc' | 'recent'>('name-asc')
const sortOptions = [
  { label: 'Name A→Z', value: 'name-asc' },
  { label: 'Name Z→A', value: 'name-desc' },
  { label: 'Most Recent', value: 'recent' },
]

function norm(v?: string) {
  return (v || '').toLowerCase().trim()
}

const filterFn = (item: any) => {
  const term = norm(q.value)
  if (!term) return true
  return [item.display_name, item.title, item.bioShort, item.bioLong]
    .map(norm)
    .some((s) => s.includes(term))
}

const sortFn = (a: any, b: any) => {
  if (sortKey.value === 'recent') {
    const at = new Date(a.updatedAt || a.createdAt || 0).getTime()
    const bt = new Date(b.updatedAt || b.createdAt || 0).getTime()
    return bt - at
  }
  const an = norm(a.display_name || a.name)
  const bn = norm(b.display_name || b.name)
  if (sortKey.value === 'name-desc') return bn.localeCompare(an)
  return an.localeCompare(bn)
}
</script>
