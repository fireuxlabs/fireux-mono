<template>
  <div>
    <UCard>
      <h1>Misebox Chefs</h1>
      <p>Current Chef: {{ chef?.chef_name || 'None' }}</p>
    </UCard>

    <UCard v-if="chef">
      <h2>Components</h2>

      <h3>Pill</h3>
      <MiseOrganismsProfilesChefCardsPill :chef="chef" />

      <USeparator />

      <h3>Cell</h3>
      <MiseOrganismsProfilesChefCardsCell :chef="chef" />

      <USeparator />

      <h3>Profile</h3>
      <MiseOrganismsProfilesChefCardsProfile :chef="chef" />
    </UCard>

    <UCard>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        "
      >
        <h2 style="margin: 0">JSON Snapshot</h2>
        <UButton
          icon="i-heroicons-clipboard-document"
          size="sm"
          variant="outline"
          @click="copyToClipboard(jsonSnapshot)"
        >
          Copy JSON
        </UButton>
      </div>
      <pre>{{ jsonSnapshot }}</pre>
    </UCard>

    <UCard>
      <h2>All Chefs ({{ chefs?.length || 0 }})</h2>

      <div v-if="chefs?.length">
        <MiseOrganismsProfilesChefCardsCell
          v-for="chefItem in chefs"
          :key="chefItem.id"
          :chef="chefItem"
        />
      </div>

      <p v-else>No chefs found</p>
    </UCard>
  </div>
</template>

<script setup>
// Note: These composables might not exist yet, but following the pattern
// const { chef, chefs, ...computedProps } = await useChef()

// For now, create mock data structure matching the pattern
const chef = ref(null)
const chefs = ref([])

// Mock computed props (would come from useChefComputed)
const isActiveChef = computed(() => !!chef.value)
const hasGallery = computed(() => chef.value?.gallery?.length > 0)
const hasKitchens = computed(() => chef.value?.kitchens?.length > 0)

// JSON snapshot for copy functionality
const jsonSnapshot = computed(() => {
  return JSON.stringify(
    {
      currentChef: chef.value,
      computedProps: {
        isActiveChef: isActiveChef.value,
        hasGallery: hasGallery.value,
        hasKitchens: hasKitchens.value,
      },
      collection: {
        total: chefs.value?.length || 0,
        chefs: chefs.value,
      },
    },
    null,
    2
  )
})

// Copy to clipboard function
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('Chef JSON copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy Chef JSON:', err)
  }
}
</script>
