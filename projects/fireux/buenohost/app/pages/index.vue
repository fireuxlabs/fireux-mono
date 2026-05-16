<template>
  <UPage>
    <UPageBody>
      <section class="py-10 sm:py-14">
        <div class="mx-auto max-w-5xl space-y-8 text-center">
          <div class="space-y-5">
            <UBadge color="primary" variant="soft" class="mx-auto">
              QR-first hospitality platform
            </UBadge>

            <div class="mx-auto max-w-3xl space-y-4">
              <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
                One QR code for every property.
              </h1>

              <p class="mx-auto max-w-2xl text-lg text-muted">
                Turn a room, apartment or holiday rental into a digital stay companion guests can open instantly.
              </p>
            </div>

            <div class="flex flex-wrap justify-center gap-3">
              <UButton
                to="/properties/holiday-with-nats/guide"
                color="primary"
                icon="i-lucide-qr-code"
              >
                Try the guest guide
              </UButton>
              <UButton
                to="/console/portfolio"
                variant="soft"
                icon="i-lucide-layout-dashboard"
              >
                Open host dashboard
              </UButton>
            </div>
          </div>

          <NuxtLink
            :to="demoGuidePath"
            class="mx-auto block max-w-3xl rounded-lg border border-default bg-muted/30 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
            aria-label="Open the Holiday with Nats guest guide"
          >
            <div class="grid gap-5 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center">
              <div class="space-y-4 px-1 sm:px-4">
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="item in guideTopics"
                    :key="item"
                    color="neutral"
                    variant="soft"
                  >
                    {{ item }}
                  </UBadge>
                </div>

                <div class="space-y-2">
                  <p class="text-sm font-medium text-primary">
                    Penthouse Holiday Apartment
                  </p>
                  <h2 class="text-2xl font-semibold tracking-normal text-highlighted">
                    Scan once. Get everything about your stay.
                  </h2>
                  <p class="max-w-xl text-sm text-muted">
                    The QR opens a mobile guide with WiFi, keys, house rules, checkout and local notes from the manual.
                  </p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="item in heroPoints"
                    :key="item"
                    color="primary"
                    variant="soft"
                  >
                    {{ item }}
                  </UBadge>
                </div>
              </div>

              <div class="mx-auto w-fit">
                <div class="rounded-lg bg-white p-4">
                  <div class="relative">
                    <img
                      v-if="qrDataUrl"
                      :src="qrDataUrl"
                      alt="QR code for the Holiday with Nats guest guide"
                      class="size-60 sm:size-64"
                    >
                    <div
                      v-else
                      class="grid size-60 place-items-center text-sm text-muted sm:size-64"
                    >
                      Creating QR...
                    </div>

                    <div
                      v-if="qrDataUrl"
                      class="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg border border-default bg-white p-3 shadow-sm"
                      aria-hidden="true"
                    >
                      <img
                        src="/img/app/logo.png"
                        alt=""
                        class="size-full rounded object-contain"
                      >
                    </div>
                  </div>
                </div>

                <div class="pt-3 text-center">
                  <div class="text-base font-semibold text-highlighted">Try me</div>
                  <div class="mt-1 text-sm text-muted">Open the demo stay guide</div>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <section class="grid gap-4 pb-12 md:grid-cols-3">
        <UCard
          v-for="feature in features"
          :key="feature.title"
          variant="subtle"
        >
          <div class="space-y-3">
            <UIcon :name="feature.icon" class="size-6 text-primary" />
            <div>
              <h2 class="font-semibold text-highlighted">
                {{ feature.title }}
              </h2>
              <p class="mt-1 text-sm text-muted">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </UCard>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { toDataURL } from 'qrcode'
import { onMounted, ref } from '#imports'

const demoGuidePath = '/properties/holiday-with-nats/guide'
const qrTargetUrl = ref('')
const qrDataUrl = ref('')
const heroPoints = [
  'No app install',
  'Live updates',
  'Guest-ready',
]
const guideTopics = [
  'WiFi',
  'Keys',
  'Checkout',
  'Safety',
]
const features = [
  {
    title: 'One scannable place',
    description: 'Guests use one QR code for the information they ask for most.',
    icon: 'i-lucide-qr-code',
  },
  {
    title: 'Manager controlled',
    description: 'Hosts update property details without reprinting the code.',
    icon: 'i-lucide-sliders-horizontal',
  },
  {
    title: 'Built for stays',
    description: 'Arrival, house rules, appliances, contacts and local tips stay together.',
    icon: 'i-lucide-house',
  },
]

onMounted(async () => {
  qrTargetUrl.value = new URL(demoGuidePath, window.location.origin).toString()
  qrDataUrl.value = await toDataURL(qrTargetUrl.value, {
    width: 512,
    margin: 1,
    errorCorrectionLevel: 'H',
  })
})

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
  description: 'Mobile guest guides and console-ready host information for holiday homes and short-stay properties.',
})
</script>
