<template>
  <div class="space-y-3">
  <div class="text-[10px] uppercase tracking-wide text-gray-400">hello from child</div>
    <!-- Display Mode -->
    <div v-if="mode === 'display'" class="space-y-2">
      <div class="flex items-start justify-between gap-2">
        <div>
          <div class="font-medium leading-6">{{ item.name || '—' }}</div>
          <div class="text-sm text-gray-500">{{ item.role || '—' }}</div>
        </div>
        <UBadge color="neutral" variant="soft">
          {{ fromLabel }} — {{ toLabel }}
        </UBadge>
      </div>
      <div
        v-if="item.responsibilities"
        class="text-gray-700 whitespace-pre-line"
      >
        {{ item.responsibilities }}
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-else class="space-y-4">
      <UForm :state="item" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UFormGroup label="Organization / Project" name="name">
            <UInput v-model="item.name" placeholder="e.g., Acme Inc." />
          </UFormGroup>
          <UFormGroup label="Role / Title" name="role">
            <UInput v-model="item.role" placeholder="e.g., Frontend Engineer" />
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

        <UFormGroup label="Responsibilities" name="responsibilities">
          <UTextarea
            v-model="item.responsibilities"
            :rows="4"
            placeholder="What did you do?"
          />
        </UFormGroup>

        <div class="flex justify-between">
          <div class="text-xs text-gray-500">Item #{{ index + 1 }}</div>
          <UButton
            v-if="remove"
            icon="i-lucide-trash-2"
            color="neutral"
            variant="soft"
            size="xs"
            @click="remove?.()"
          >
            Remove
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
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
</script>
