<template>
  <form aria-labelledby="ignition-brief-heading" @submit.prevent="start">
    <UCard class="ignition-brief">
      <template #header>
        <h2 id="ignition-brief-heading" class="fx-type-card-heading">
          Start with an idea
        </h2>
      </template>
      <div class="ignition-brief__body">
        <UFormField label="What industry are you building for?">
          <UTextarea
            v-model="idea"
            class="ignition-brief__idea"
            placeholder="A dog grooming platform where salons manage their team, treatments and bookings…"
            :rows="3"
            :maxlength="2000"
            autoresize
            required
          />
        </UFormField>
        <div
          class="ignition-brief__examples"
          role="group"
          aria-label="Example industries"
        >
          <UButton
            v-for="example in examples"
            :key="example.label"
            :label="example.label"
            :icon="example.icon"
            type="button"
            color="neutral"
            variant="soft"
            size="sm"
            @click="idea = example.idea"
          />
        </div>
      </div>
      <template #footer>
        <div class="ignition-brief__footer">
          <span class="fx-type-caption">
            Ignition helps you prepare a brief and open an email enquiry. FireUX
            agrees the scope and price with you before delivery starts.
          </span>
          <UButton
            type="submit"
            label="Start an Ignition brief"
            icon="i-lucide-arrow-up-right"
            :disabled="!idea.trim()"
          />
        </div>
      </template>
    </UCard>
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

<style scoped>
.ignition-brief {
  background-color: var(--ui-bg);
  box-shadow: 0 20px 60px
    color-mix(in srgb, var(--ui-text-highlighted) 8%, transparent);
}

.ignition-brief__body,
.ignition-brief__footer {
  display: grid;
  gap: 0.875rem;
}

.ignition-brief__examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.ignition-brief__idea {
  width: 100%;
}

.ignition-brief__footer {
  justify-items: start;
}
</style>
