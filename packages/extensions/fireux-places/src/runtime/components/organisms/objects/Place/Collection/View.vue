<template>
  <OrganismsObjectsPlaceCollectionManager
    :keyword="keyword"
    :type="type"
    v-slot="{ cells, total }"
  >
    <UCard :ui="{ body: 'space-y-4' }">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm font-semibold">
            <UIcon name="i-lucide-bookmark" /> {{ title }}
          </div>
          <UBadge color="neutral" variant="soft" size="xs">{{ total }}</UBadge>
        </div>
      </template>

      <div v-if="cells.length" class="space-y-2">
        <UButton
          v-for="cell in cells"
          :key="cell.place_id"
          :to="`/places/${cell.place_id}`"
          color="neutral"
          variant="ghost"
          class="w-full justify-start px-3 py-3"
        >
          <OrganismsObjectsPlaceCell :place="cell" />
        </UButton>
      </div>

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        icon="i-lucide-inbox"
        title="No saved places yet"
        description="Add a place to Firestore and it will appear here instantly."
      />
    </UCard>
  </OrganismsObjectsPlaceCollectionManager>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    keyword?: string | null
    type?: string | null
    title?: string
  }>(),
  {
    keyword: null,
    type: null,
    title: 'Saved places',
  }
)

const { keyword, type, title } = props
</script>
