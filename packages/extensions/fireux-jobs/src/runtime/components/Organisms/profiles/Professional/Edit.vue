<!-- Professional Edit -->
<template>
  <ClientOnly>
    <template v-if="professional">
      <div class="space-y-8">
        <!-- Section 1 — Basics (collapsed by default) -->
        <section>
          <details>
            <summary class="cursor-pointer select-none text-base font-semibold">
              Section 1 — Basics
            </summary>
            <div class="mt-4">
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <UCard>
                  <div class="text-base font-medium">hello left</div>
                </UCard>
                <UCard>
                  <div class="text-base font-medium text-right lg:text-left">
                    hello right
                  </div>
                </UCard>
              </div>
            </div>
          </details>
        </section>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Section 2 — Relevant Experience -->
          <section>
            <details open>
              <summary
                class="cursor-pointer select-none text-base font-semibold"
              >
                Section 2 — Relevant Experience
              </summary>

              <div class="mt-4">
                <OrganismsProfilesProfessionalFieldsExperienceSection
                  title="hello left"
                >
                  <UCard>
                    <div class="text-base font-medium">hello left</div>
                  </UCard>
                </OrganismsProfilesProfessionalFieldsExperienceSection>
              </div>
            </details>
          </section>

          <!-- Section 3 — Other Experience -->
          <section>
            <details>
              <summary
                class="cursor-pointer select-none text-base font-semibold"
              >
                Section 3 — Other Experience
              </summary>

              <div class="mt-4">
                <OrganismsProfilesProfessionalFieldsExperienceSection
                  title="hello right"
                >
                  <UCard>
                    <div class="text-base font-medium">hello right</div>
                  </UCard>
                </OrganismsProfilesProfessionalFieldsExperienceSection>
              </div>
            </details>
          </section>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
defineProps<{ professional: any }>()
</script>
