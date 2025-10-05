<template>
  <!-- Display Mode -->
  <div class="space-y-3" v-if="mode === 'display'">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <MoleculesPill
          :avatar="item.image_url || ''"
          :title="item.name || '—'"
          :subtitle="item.role || '—'"
        />
      </div>
      <UButton
        size="xs"
        variant="soft"
        icon="i-lucide-pencil"
        @click="emit('edit')"
      >
        Edit
      </UButton>
    </div>

    <div class="flex items-center gap-2">
      <UBadge color="neutral" variant="soft">{{ dateRange }}</UBadge>
      <UBadge v-if="item.ongoing" color="primary" variant="soft"
        >Ongoing</UBadge
      >
    </div>

    <UBadge
      v-if="address"
      color="neutral"
      variant="soft"
      class="max-w-full overflow-hidden"
    >
      <UIcon name="i-lucide-map-pin" class="shrink-0" />
      <span class="truncate">{{ address }}</span>
    </UBadge>

    <div
      v-if="item.responsibilities"
      class="text-sm text-gray-700 whitespace-pre-line"
    >
      {{ item.responsibilities }}
    </div>
  </div>

  <!-- Edit Mode -->
  <div
    v-else
    class="rounded-xl bg-gradient-to-r from-primary-500/70 via-primary-400/50 to-neutral-200/50 p-[1.5px] shadow-lg"
  >
    <UCard class="h-full rounded-[inherit] bg-white/95">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="soft" size="xs"> Editing </UBadge>
            <div class="font-medium">Edit {{ item.name || 'Experience' }}</div>
          </div>
          <UButton
            v-if="hasRemoveAction"
            icon="i-lucide-trash-2"
            color="error"
            variant="soft"
            size="xs"
            @click="emit('remove')"
          >
            Remove
          </UButton>
        </div>
      </template>

      <UForm :state="item" class="space-y-4" @submit.prevent="emit('save')">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UFormGroup label="Organization / Project" name="name">
            <UInput v-model="item.name" placeholder="e.g., Acme Inc." />
          </UFormGroup>
          <UFormGroup label="Role / Title" name="role">
            <UInput v-model="item.role" placeholder="e.g., Sous Chef" />
          </UFormGroup>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UFormGroup label="From" name="from">
            <div class="grid grid-cols-2 gap-2">
              <USelect
                v-model="item.from_month"
                :options="months"
                placeholder="Month"
              />
              <USelect
                v-model="item.from_year"
                :options="years"
                placeholder="Year"
              />
            </div>
          </UFormGroup>

          <UFormGroup label="To" name="to">
            <div class="grid grid-cols-2 gap-2">
              <USelect
                v-model="item.to_month"
                :options="months"
                placeholder="Month"
                :disabled="item.ongoing"
              />
              <USelect
                v-model="item.to_year"
                :options="years"
                placeholder="Year"
                :disabled="item.ongoing"
              />
            </div>
          </UFormGroup>
        </div>

        <div class="flex items-center justify-between">
          <UCheckbox v-model="item.ongoing" label="Ongoing / Present" />
        </div>

        <UFormGroup label="Address (optional)" name="formatted_address">
          <UInput
            v-model="item.formatted_address"
            placeholder="e.g., Interlaken, Switzerland"
          />
        </UFormGroup>

        <UFormGroup label="Logo URL (optional)" name="image_url">
          <UInput v-model="item.image_url" placeholder="https://..." />
        </UFormGroup>

        <UFormGroup label="Responsibilities" name="responsibilities">
          <UTextarea
            v-model="item.responsibilities"
            :rows="4"
            placeholder="What did you do?"
          />
        </UFormGroup>
      </UForm>

      <div class="flex justify-end gap-2 pt-4">
        <UButton
          size="sm"
          variant="soft"
          color="neutral"
          @click="emit('cancel')"
        >
          Cancel
        </UButton>
        <UButton
          size="sm"
          variant="solid"
          color="primary"
          @click="emit('save')"
        >
          Save
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'save'): void
  (e: 'cancel'): void
  (e: 'remove'): void
}>()

const props = defineProps<{
  item: any
  index: number
  mode: 'display' | 'edit'
  remove?: () => void
}>()

const months = [
  { label: 'Jan', value: 'Jan' },
  { label: 'Feb', value: 'Feb' },
  { label: 'Mar', value: 'Mar' },
  { label: 'Apr', value: 'Apr' },
  { label: 'May', value: 'May' },
  { label: 'Jun', value: 'Jun' },
  { label: 'Jul', value: 'Jul' },
  { label: 'Aug', value: 'Aug' },
  { label: 'Sep', value: 'Sep' },
  { label: 'Oct', value: 'Oct' },
  { label: 'Nov', value: 'Nov' },
  { label: 'Dec', value: 'Dec' },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 60 }, (_, i) => currentYear - i).map(
  (y) => ({ label: String(y), value: String(y) })
)

const fromLabel = computed(() => {
  const m = props.item?.from_month || '—'
  const y = props.item?.from_year || '—'
  return `${m} ${y}`.trim()
})

const toLabel = computed(() => {
  if (props.item?.ongoing) return 'Present'
  const m = props.item?.to_month
  const y = props.item?.to_year
  const val = [m, y].filter(Boolean).join(' ')
  return val || '—'
})

const dateRange = computed(() => `${fromLabel.value} — ${toLabel.value}`)

const address = computed(
  () => props.item?.formatted_address || props.item?.short_address || ''
)

const hasRemoveAction = computed(() => typeof props.remove === 'function')
</script>
