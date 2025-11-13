<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>{{ title }}</h2>
        <UBadge variant="soft">{{ total }} total</UBadge>
      </div>
      <p v-if="description" class="text-sm opacity-70">
        {{ description }}
      </p>
    </template>

    <div v-if="pills.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <JobProfilesProfessionalCardsPill
        v-for="pill in pills"
        :key="pillKey(pill)"
        :professional="pill"
      />
    </div>
    <p v-else class="text-sm opacity-70">
      No professionals found in this environment.
    </p>
  </UCard>
</template>

<script setup lang="ts">

const props = withDefaults(
  defineProps<{ title?: string; description?: string }>(),
  {
    title: 'Professional Directory',
    description: '',
  }
)

const { profile } = useProfessional()
const { professionals } = useProfessionalCollection()
const { pillProps } = useProfessionalInterface(profile)

const pills = computed(() =>
  (professionals.value ?? []).map((entry) => pillProps(entry))
)

const total = computed(() => pills.value.length)

const pillKey = (pill: ProfessionalCard.Pill) =>
  `${pill.title ?? ''}-${pill.subtitle ?? ''}-${pill.to ?? ''}`

const title = computed(() => props.title)
const description = computed(() => props.description)
</script>
