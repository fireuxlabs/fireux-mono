<template>
  <UContainer>
    <UPage class="mx-auto max-w-3xl">
      <UPageHeader
        headline="FireUX Ignition"
        title="Start with your industry."
        description="Shape the platform, its operating Workspace and the Apps your customers will use."
      />
      <UPageBody>
        <UCard>
          <form class="space-y-6" @submit.prevent="prepare">
            <UFormField label="Your idea" required>
              <UTextarea
                v-model="idea"
                :maxlength="2000"
                :rows="5"
                class="w-full"
                required
                placeholder="Describe the industry and what its businesses need to do."
              />
            </UFormField>
            <UFormField label="Who will use it?">
              <UInput
                v-model="audience"
                :maxlength="300"
                class="w-full"
                placeholder="Business owners, their teams and customers"
              />
            </UFormField>
            <UFormField label="What is the first job it must do?">
              <UTextarea
                v-model="firstJob"
                :maxlength="1000"
                :rows="3"
                class="w-full"
                placeholder="For example: book a treatment and manage it through pickup."
              />
            </UFormField>
            <UButton
              type="submit"
              label="Prepare my brief"
              :disabled="!idea.trim()"
              trailing-icon="i-lucide-arrow-right"
            />
          </form>
        </UCard>
        <UCard v-if="brief" aria-live="polite">
          <template #header
            ><h2 class="text-xl font-semibold">
              Your starting brief
            </h2></template
          >
          <p class="whitespace-pre-wrap">{{ brief }}</p>
          <template #footer>
            <div class="space-y-3">
              <UButton
                :to="enquiry"
                label="Discuss this with FireUX"
                trailing-icon="i-lucide-mail"
              />
              <p class="text-sm text-muted">
                Opens an email draft. Scope, delivery and pricing are agreed
                with FireUX. This brief has not been submitted or saved.
              </p>
            </div>
          </template>
        </UCard>
        <UPageFeature
          title="One foundation, your industry rules"
          description="An operating Workspace and connected capabilities, composed around the business you want to serve."
          icon="i-lucide-layers-3"
        />
        <UButton
          to="/pricing/your-ecosystem"
          label="Explore the industry platform offer"
          color="neutral"
          variant="link"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
definePageMeta({
  layout: 'framework',
  requiresAuth: false,
  nav: { hidden: true },
})
useSeoMeta({
  title: 'Start Ignition · FireUX',
  description:
    'Prepare a starting brief for your industry SaaS and discuss its scope with FireUX.',
  robots: 'noindex, nofollow',
})
const idea = useState<string>('fireux-ignition-idea', () => '')
const audience = ref('')
const firstJob = ref('')
const brief = ref('')
function prepare() {
  if (!idea.value.trim()) return
  brief.value = [
    idea.value.trim(),
    audience.value.trim() && `Who it serves: ${audience.value.trim()}`,
    firstJob.value.trim() && `First journey: ${firstJob.value.trim()}`,
  ]
    .filter(Boolean)
    .join('\n\n')
}
const enquiry = computed(
  () =>
    `mailto:fire@fireux.app?subject=${encodeURIComponent('FireUX industry SaaS · Ignition brief')}&body=${encodeURIComponent(brief.value)}`
)
</script>
