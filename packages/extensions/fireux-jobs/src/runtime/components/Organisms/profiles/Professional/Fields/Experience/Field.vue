<template>
  <!-- Display Mode -->
  <UCard
    v-if="mode === 'display'"
    class="hover:ring-1 hover:ring-gray-200 transition"
  >
    <div class="flex items-start gap-4">
      <div class="shrink-0">
        <img
          v-if="item.image_url"
          :src="item.image_url"
          :alt="item.name || 'Logo'"
          class="h-12 w-12 rounded object-cover"
        />
        <div
          v-else
          class="h-12 w-12 rounded bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
        >
          {{ initials }}
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-3">
          <div class="truncate">
            <div class="font-medium leading-6 truncate">
              {{ item.name || '—' }}
            </div>
            <div class="text-sm text-gray-500 truncate">
              {{ item.role || '—' }}
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <UBadge color="neutral" variant="soft">{{ dateRange }}</UBadge>
            <UBadge v-if="item.ongoing" color="primary" variant="soft"
              >Ongoing</UBadge
            >
          </div>
        </div>

        <div
          v-if="address"
          class="mt-1 text-xs text-gray-500 flex items-center gap-1"
        >
          <i class="i-lucide-map-pin w-3.5 h-3.5 opacity-70"></i>
          <span class="truncate">{{ address }}</span>
        </div>

        <div
          v-if="item.responsibilities"
          class="mt-3 text-sm text-gray-700 whitespace-pre-line"
        >
          {{ item.responsibilities }}
        </div>
      </div>
    </div>
  </UCard>

  <!-- Edit Mode -->
  <UCard v-else>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Edit {{ item.name || 'Experience' }}</div>
        <UButton
          v-if="remove"
          icon="i-lucide-trash-2"
          color="error"
          variant="soft"
          size="xs"
          @click="remove?.()"
        >
          Remove
        </UButton>
      </div>
    </template>

    <UForm :state="item" class="space-y-4">
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
        <div class="text-xs text-gray-500">
          If ongoing, the "To" fields are disabled.
        </div>
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

      <div class="text-xs text-gray-500">Item #{{ index + 1 }}</div>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const initials = computed(() => {
  const name = String(props.item?.name || '')
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  return letters || '•'
})
</script>
