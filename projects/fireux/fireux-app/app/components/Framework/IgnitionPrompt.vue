<template>
  <form class="fx-page-stack" @submit.prevent="start">
    <UCard>
      <UFormField label="What industry are you building for?">
        <UTextarea
          v-model="idea"
          placeholder="A dog grooming platform where salons manage their team, treatments and bookings…"
          :rows="3"
          :maxlength="2000"
          autoresize
          required
        />
      </UFormField>
      <div class="fx-page-stack">
        <span class="fx-type-caption">Start with the business you know.</span>
        <UButton
          type="submit"
          label="Start Ignition"
          icon="i-lucide-arrow-up-right"
          :disabled="!idea.trim()"
        />
      </div>
    </UCard>
    <div class="fx-page-stack" aria-label="Example industries">
      <UButton
        v-for="example in examples"
        :key="example.label"
        :label="example.label"
        :icon="example.icon"
        color="neutral"
        variant="outline"
        size="sm"
        @click="idea = example.idea"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
const idea = useState<string>('fireux-ignition-idea', () => '')
const examples = [
  {
    label: 'Dog grooming',
    icon: 'i-lucide-paw-print',
    idea: 'A dog grooming platform where salons manage their team, treatments, bookings and customer Apps.',
  },
  {
    label: 'Property hosting',
    icon: 'i-lucide-house',
    idea: 'A property hosting platform where hosts manage properties, stays, guest information and branded customer Apps.',
  },
  {
    label: 'Practical services',
    icon: 'i-lucide-wrench',
    idea: 'A practical services platform where businesses manage their team, services, customer requests and jobs.',
  },
]
async function start() {
  if (!idea.value.trim()) return
  idea.value = idea.value.trim().slice(0, 2000)
  await navigateTo('/ignite')
}
</script>
