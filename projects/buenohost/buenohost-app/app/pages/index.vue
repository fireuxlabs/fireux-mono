<template>
  <UPage>
    <UPageBody class="space-y-16 pb-16 pt-10 sm:pt-14">
      <section>
        <div class="max-w-4xl space-y-5">
          <UBadge color="primary" variant="soft">
            Property management tools
          </UBadge>

          <div class="space-y-4">
            <h1 class="max-w-5xl text-5xl font-semibold leading-tight tracking-normal text-highlighted sm:text-6xl lg:text-7xl">
              The digital stay companion for your guests.
            </h1>
            <p class="max-w-2xl text-lg text-muted">
              Turn any room, apartment or holiday into a digital stay companion and local guide.
            </p>
          </div>
        </div>
      </section>

      <section
        class="space-y-6"
        aria-labelledby="sample-info-title"
      >
        <UCard variant="subtle">
          <div class="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-center">
            <div class="space-y-4">
              <div class="mx-auto flex max-w-sm flex-col items-center gap-2">
                <UButton
                  :to="previewInfoPath"
                  color="primary"
                  variant="soft"
                  icon="i-lucide-qr-code"
                  class="w-full justify-center"
                >
                  View local stay simulation
                </UButton>
                <div class="text-center text-sm text-muted">
                  <div>- or -</div>
                  <div>scan below</div>
                </div>
              </div>

              <NuxtLink
                :to="previewInfoPath"
                class="mx-auto block w-full max-w-sm rounded-lg border border-default bg-white p-5 text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                aria-label="Open the local stay simulation"
              >
                <div class="space-y-5 text-center">
                  <div>
                    <p class="text-sm font-medium uppercase tracking-wide text-slate-500">
                      Mountain Stay Preview
                    </p>
                    <h3 class="mt-1 text-2xl font-semibold tracking-normal">
                      Everything about your stay.
                    </h3>
                  </div>

                  <div class="mx-auto w-fit rounded-lg border border-slate-200 bg-white p-3">
                    <div class="relative">
                      <img
                        v-if="qrDataUrl"
                        :src="qrDataUrl"
                        alt="QR code for the local stay simulation"
                        class="size-56"
                      >
                      <div
                        v-else
                        class="grid size-56 place-items-center text-sm text-slate-500"
                      >
                        Creating QR...
                      </div>

                      <div
                        v-if="qrDataUrl"
                        class="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                        aria-hidden="true"
                      >
                        <img
                          src="/img/app/logo.png"
                          alt=""
                          class="size-full rounded-sm object-contain"
                        >
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-wrap justify-center gap-2">
                    <UBadge
                      v-for="item in stickerTopics"
                      :key="item"
                      color="primary"
                      variant="soft"
                    >
                      {{ item }}
                    </UBadge>
                  </div>

                </div>
              </NuxtLink>
            </div>

            <div id="upload" class="flex h-full flex-col gap-5">
              <div class="space-y-2">
                <h2 id="sample-info-title" class="text-2xl font-semibold tracking-normal text-highlighted">
                  A mobile house manual for tenants and short stays.
                </h2>
                <p class="text-muted">
                  BuenoHost organises your check-in, parking, house rules, apartment details, local recommendations, checkout and emergency information into one mobile house manual.
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div
                  v-for="item in guestAppPreview"
                  :key="item.title"
                  class="rounded-lg border border-default bg-default p-4"
                >
                  <div class="flex items-start gap-3">
                    <UIcon :name="item.icon" class="mt-0.5 size-5 text-primary" />
                    <div>
                      <h4 class="font-medium text-highlighted">
                        {{ item.title }}
                      </h4>
                      <p class="mt-1 text-sm text-muted">
                        {{ item.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-lg border border-default bg-muted/30 p-4">
                <ul class="grid gap-x-4 gap-y-1 text-sm text-muted sm:grid-cols-2">
                  <li
                    v-for="item in extraInfoBullets"
                    :key="item"
                    class="flex gap-2"
                  >
                    <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <div class="mt-auto space-y-3">
                <h4 class="font-medium text-highlighted">
                  Try before you buy
                </h4>
                <p class="text-sm text-muted">
                  Upload your current welcome document. We’ll turn it into a hosted guest URL with a QR code.
                </p>
                <UButton
                  href="#upload"
                  color="primary"
                  icon="i-lucide-file-up"
                >
                  Upload your welcome document
                </UButton>
                <p class="text-xs text-muted">
                  Formats: PDF, DOCX, Pages, images, or plain text.
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <section
        aria-label="Pricing"
      >
        <UPricingPlans :plans="pricingPlans" />
      </section>

      <LandingSolutions variant="preview" />

      <section
        class="space-y-6"
        aria-labelledby="companion-console-demo"
      >
        <div class="max-w-2xl space-y-2">
          <UButton
            id="companion-console-demo"
            to="/console/property"
            size="xl"
            variant="subtle"
            color="primary"
            icon="i-lucide-circle-play"
          >
            Demo the host console
          </UButton>
          <p class="text-muted">
            Open the Property console shape before data wiring is added.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <UCard
            v-for="feature in consoleFeatures"
            :key="feature.title"
            variant="subtle"
          >
            <div class="space-y-3">
              <UIcon :name="feature.icon" class="size-6 text-primary" />
              <div>
                <h3 class="font-semibold text-highlighted">
                  {{ feature.title }}
                </h3>
                <p class="mt-1 text-sm text-muted">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

      </section>

      <section
        class="space-y-6"
        aria-labelledby="integrations-title"
      >
        <div class="max-w-3xl space-y-2">
          <h2 id="integrations-title" class="text-2xl font-semibold tracking-normal text-highlighted">
            Integrations
          </h2>
          <p class="text-xl font-medium text-highlighted">
            Connect the stay to the services around it.
          </p>
          <p class="text-muted">
            BuenoHost can connect your guest information, operations and hospitality services, from calendar-based arrivals to translations, private chefs and cleaning teams.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <NuxtLink
            v-for="card in resolvedIntegrationCards"
            :key="card.title"
            :to="card.href"
            :target="isExternalUrl(card.href) ? '_blank' : undefined"
            :rel="isExternalUrl(card.href) ? 'noopener noreferrer' : undefined"
            class="group block h-full"
          >
            <UCard
              variant="subtle"
              class="h-full transition group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-sm"
            >
              <div class="flex h-full flex-col gap-4">
                <div class="flex h-12 items-center justify-between gap-3">
                  <img
                    v-if="card.brandSrc"
                    :src="card.brandSrc"
                    :alt="`${card.title} wordmark`"
                    class="max-h-9 max-w-36 object-contain"
                    loading="lazy"
                  >
                  <div
                    v-else
                    class="grid size-11 place-items-center rounded-lg bg-primary/10"
                  >
                    <UIcon :name="card.icon" class="size-6 text-primary" />
                  </div>
                  <UIcon
                    name="i-lucide-arrow-up-right"
                    class="size-4 shrink-0 text-muted transition group-hover:text-primary"
                  />
                </div>

                <div>
                  <h3 class="font-semibold text-highlighted">
                    {{ card.title }}
                  </h3>
                  <p class="mt-1 text-sm text-muted">
                    {{ card.description }}
                  </p>
                </div>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useBuenoHostHome } from '../composables/useBuenoHostHome'

const {
  consoleFeatures,
  extraInfoBullets,
  guestAppPreview,
  isExternalUrl,
  previewInfoPath,
  pricingPlans,
  qrDataUrl,
  resolvedIntegrationCards,
  stickerTopics,
} = useBuenoHostHome()

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'BuenoHost',
  description: 'Turn house manuals into digital stay companions with a guest URL, QR code and host console.',
})
</script>
