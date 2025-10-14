<template>
  <section class="space-y-4">
    <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
      <!-- Search input (hidden when selected) -->
      <OrganismsPlacesSearchBar v-if="!selected" v-model="query" />

      <!-- Selected place & experience form -->
      <div v-if="selected" class="rounded-xl bg-background-2/90 p-4 space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <MoleculesPill
            :avatar="selected.avatar || ''"
            :title="selected.name"
            :subtitle="selected.formatted_address || '—'"
          />
        </div>

        <UForm :state="form" class="space-y-6" @submit.prevent="onConfirm">
          <div class="grid gap-4 md:grid-cols-2">
            <UFormGroup
              label="Role"
              name="role"
              description="Add a concise title for this experience."
              :error="fieldErrors.role"
            >
              <UInput
                v-model="form.role"
                placeholder="Role (e.g. Sous Chef)"
                autocomplete="off"
              />
            </UFormGroup>

            <UFormGroup
              label="Responsibilities"
              name="responsibilities"
              class="md:col-span-2"
              description="Optional summary of impact, responsibilities, or achievements."
            >
              <UTextarea
                v-model="form.responsibilities"
                :rows="3"
                placeholder="Key responsibilities or accomplishments"
              />
            </UFormGroup>
          </div>

          <div class="space-y-4">
            <div class="text-sm font-medium text-neutral-700">Timeline</div>

            <div class="grid gap-4 md:grid-cols-2">
              <UFormGroup label="Start month" name="from_month">
                <USelect
                  v-model="form.from_month"
                  :items="monthOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Select month"
                />
              </UFormGroup>

              <UFormGroup
                label="Start year"
                name="from_year"
                :error="fieldErrors.from_year"
              >
                <USelect
                  v-model="form.from_year"
                  :items="yearOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Select year"
                  searchable
                />
              </UFormGroup>
            </div>

            <div
              class="flex items-center gap-3 text-sm font-medium text-neutral-900"
            >
              <USwitch v-model="form.ongoing" />
              <span>Ongoing</span>
            </div>

            <div v-if="!form.ongoing" class="grid gap-4 md:grid-cols-2">
              <UFormGroup label="End month" name="to_month">
                <USelect
                  v-model="form.to_month"
                  :items="monthOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Select month"
                />
              </UFormGroup>

              <UFormGroup
                label="End year"
                name="to_year"
                :error="fieldErrors.to_year"
              >
                <USelect
                  v-model="form.to_year"
                  :items="yearOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Select year"
                  searchable
                />
              </UFormGroup>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              :disabled="isLoading"
              @click="onClear"
            >
              Clear
            </UButton>
            <UButton
              size="sm"
              color="primary"
              type="submit"
              :loading="isLoading"
              :disabled="!canConfirm || isLoading"
            >
              Confirm
            </UButton>
          </div>
        </UForm>
      </div>

      <!-- Dropdown suggestions (hidden when selected) -->
      <OrganismsPlacesSearchDropdown
        v-else-if="results.length"
        :cells="results"
        @select="select"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { usePlacesSearch } from 'fireux-places/runtime/composables/usePlacesSearch.ts'
import type { BasePlace } from 'fireux-places/runtime/models/place.model.ts'

type ExperienceItem = {
  role?: string
  from_month?: string
  from_year?: string
  to_month?: string | null
  to_year?: string | null
  responsibilities?: string
  ongoing?: boolean
  // snapshot of selected place (works for both relevant & other experience flows)
  place_id?: string
  name?: string
  formatted_address?: string
  image_url?: string | null
}

const emit = defineEmits<{
  (e: 'confirm', payload: ExperienceItem): void
  (e: 'clear'): void
}>()

const props = defineProps<{ loading?: boolean }>()

const { query, results, selected, select, clear } = usePlacesSearch()

const form = reactive({
  role: '',
  responsibilities: '',
  from_month: '',
  from_year: '',
  to_month: '',
  to_year: '',
  ongoing: false,
})

const monthOptions = [
  { label: 'January', value: 'January' },
  { label: 'February', value: 'February' },
  { label: 'March', value: 'March' },
  { label: 'April', value: 'April' },
  { label: 'May', value: 'May' },
  { label: 'June', value: 'June' },
  { label: 'July', value: 'July' },
  { label: 'August', value: 'August' },
  { label: 'September', value: 'September' },
  { label: 'October', value: 'October' },
  { label: 'November', value: 'November' },
  { label: 'December', value: 'December' },
]

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const span = 50
  return Array.from({ length: span + 6 }, (_, index) => {
    const year = currentYear + 1 - index
    return { label: year.toString(), value: year.toString() }
  })
})

const isLoading = computed(() => props.loading === true)

const YEAR_PATTERN = /^\d{4}$/

const fieldErrors = computed(() => {
  const issues: Record<'role' | 'from_year' | 'to_year', string | null> = {
    role: null,
    from_year: null,
    to_year: null,
  }

  const role = clean(form.role)
  if (!role) {
    issues.role = 'Add a role so this experience is identifiable.'
  }

  const startYear = clean(form.from_year)
  if (!startYear) {
    issues.from_year = 'Provide the start year for this experience.'
  } else if (!YEAR_PATTERN.test(startYear)) {
    issues.from_year = 'Use a four-digit year (e.g. 2024).'
  }

  const endYear = clean(form.to_year)
  if (!form.ongoing) {
    if (!endYear) {
      issues.to_year = 'Add an end year or mark this role as ongoing.'
    } else if (!YEAR_PATTERN.test(endYear)) {
      issues.to_year = 'Use a four-digit year (e.g. 2024).'
    } else if (startYear && YEAR_PATTERN.test(startYear)) {
      if (Number(endYear) < Number(startYear)) {
        issues.to_year = 'End year must be the same or after the start year.'
      }
    }
  } else if (endYear && !YEAR_PATTERN.test(endYear)) {
    issues.to_year = 'Use a four-digit year (e.g. 2024).'
  }

  return issues
})

const hasErrors = computed(() =>
  Object.values(fieldErrors.value).some((message) => !!message)
)

const canConfirm = computed(() => Boolean(selected.value) && !hasErrors.value)

// build the outgoing payload (minimal snapshot)
const payload = computed<ExperienceItem>(() => {
  const s = selected.value as BasePlace | null
  return {
    role: clean(form.role),
    responsibilities: clean(form.responsibilities),
    from_month: clean(form.from_month),
    from_year: clean(form.from_year),
    to_month: form.ongoing ? null : clean(form.to_month),
    to_year: form.ongoing ? null : clean(form.to_year),
    ongoing: form.ongoing || undefined,
    place_id: s?.place_id,
    name: s?.name,
    formatted_address: s?.formatted_address,
    image_url: s?.avatar ?? null,
  }
})

function clean(v?: string) {
  const t = (v ?? '').trim()
  return t.length ? t : undefined
}

function resetForm() {
  form.role = ''
  form.responsibilities = ''
  form.from_month = ''
  form.from_year = ''
  form.to_month = ''
  form.to_year = ''
  form.ongoing = false
}

function onClear() {
  if (isLoading.value) return
  resetForm()
  clear()
  emit('clear')
}

function onConfirm() {
  if (!selected.value || hasErrors.value || isLoading.value) return
  emit('confirm', payload.value)
}

watch(
  () => form.ongoing,
  (isOngoing) => {
    if (isOngoing) {
      form.to_month = ''
      form.to_year = ''
    }
  }
)

watch(
  () => selected.value?.place_id,
  (placeId, prev) => {
    if (!placeId && prev) {
      resetForm()
    }
  }
)

watch(
  () => isLoading.value,
  (loading, prev) => {
    if (!loading && prev) {
      resetForm()
      clear()
      emit('clear')
    }
  }
)
</script>
