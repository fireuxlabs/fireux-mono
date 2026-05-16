<template>
  <UPage>
    <UPageBody class="space-y-16 pb-16 pt-10 sm:pt-14">
      <section>
        <div class="max-w-4xl space-y-5">
          <UBadge color="primary" variant="soft">
            Property management tools
          </UBadge>

          <div class="space-y-4">
            <h1 class="max-w-4xl text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl lg:text-6xl">
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
        aria-labelledby="sample-guide-title"
      >
        <UCard variant="subtle">
          <div class="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-center">
            <div class="space-y-4">
              <div class="mx-auto flex max-w-sm flex-col items-center gap-2">
                <UButton
                  :to="demoGuidePath"
                  color="primary"
                  variant="soft"
                  icon="i-lucide-qr-code"
                  class="w-full justify-center"
                >
                  View sample stay companion
                </UButton>
                <div class="text-center text-sm text-muted">
                  <div>- or -</div>
                  <div>scan below</div>
                </div>
              </div>

              <NuxtLink
                :to="demoGuidePath"
                class="mx-auto block w-full max-w-sm rounded-lg border border-default bg-white p-5 text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                aria-label="Open the Holiday with Nats stay companion"
              >
                <div class="space-y-5 text-center">
                  <div>
                    <p class="text-sm font-medium uppercase tracking-wide text-slate-500">
                      Penthouse Holiday Apartment
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
                        alt="QR code for the Holiday with Nats stay companion"
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
                          class="size-full rounded object-contain"
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

                  <p class="text-sm text-slate-600">
                    No app install. Always up to date.
                  </p>
                </div>
              </NuxtLink>
            </div>

            <div id="upload" class="flex h-full flex-col gap-5">
              <div class="space-y-2">
                <h2 id="sample-guide-title" class="text-2xl font-semibold tracking-normal text-highlighted">
                  The house manual becomes a mobile guide.
                </h2>
                <p class="text-muted">
                  Nat’s manual already has Wi-Fi, parking, rules, emergency info, checkout notes and local tips. BuenoHost gives that content a better guest shape.
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

              <div class="mt-auto space-y-3">
                <p class="text-sm text-muted">
                  Upload your existing house manual, guest PDF or welcome document. BuenoHost turns it into a clean mobile guest experience with a shareable URL, QR code and editable host console.
                </p>
                <UButton
                  href="#upload"
                  color="primary"
                  icon="i-lucide-upload"
                >
                  Upload your house manual
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <section
        class="space-y-6"
        aria-labelledby="sections-title"
      >
        <div class="max-w-2xl space-y-2">
          <UBadge color="neutral" variant="soft">
            What the guest sees
          </UBadge>
          <h2 id="sections-title" class="text-3xl font-semibold tracking-normal text-highlighted">
            Clear sections instead of a long document.
          </h2>
          <p class="text-muted">
            Each topic becomes a simple guest screen the host can update later.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="section in sectionPreviews"
            :key="section.title"
            variant="subtle"
          >
            <div class="space-y-3">
              <UIcon :name="section.icon" class="size-6 text-primary" />
              <div>
                <h3 class="font-semibold text-highlighted">
                  {{ section.title }}
                </h3>
                <p class="mt-1 text-sm text-muted">
                  {{ section.description }}
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <section
        class="rounded-lg border border-default bg-muted/30 p-5"
        aria-labelledby="sticker-context-title"
      >
        <div class="max-w-2xl space-y-2">
          <UBadge color="neutral" variant="soft">
            Sample sticker and guest app
          </UBadge>
          <h2 id="sticker-context-title" class="text-xl font-semibold tracking-normal text-highlighted">
            One sticker, one guest experience.
          </h2>
          <p class="text-sm text-muted">
            Put the QR code on a welcome card, folder or fridge sticker. Guests scan once and get the latest stay information.
          </p>
        </div>
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

const stickerTopics = [
  'Welcome',
  'Check-in',
  'Parking',
  'Checkout',
  'House rules',
  'Local guide',
]

const guestAppPreview = [
  {
    title: 'Welcome',
    description: 'Arrival note, Wi-Fi, host contact and first steps.',
    icon: 'i-lucide-hand-heart',
  },
  {
    title: 'Emergency',
    description: 'Urgent numbers and safety equipment.',
    icon: 'i-lucide-siren',
  },
  {
    title: 'Local Guide',
    description: 'Shops, transport and nearby recommendations.',
    icon: 'i-lucide-map-pin',
  },
]

const sectionPreviews = [
  {
    title: 'Welcome',
    description: 'Arrival note, Wi-Fi, host contact and key first steps.',
    icon: 'i-lucide-home',
  },
  {
    title: 'Check-in',
    description: 'Arrival, access, keys and settling-in details.',
    icon: 'i-lucide-door-open',
  },
  {
    title: 'House Rules',
    description: 'Important rules without making the stay feel negative.',
    icon: 'i-lucide-clipboard-check',
  },
  {
    title: 'Parking',
    description: 'Where to park, what to avoid and building notes.',
    icon: 'i-lucide-car',
  },
  {
    title: 'Checkout',
    description: 'Dishes, keys, rubbish and leaving instructions.',
    icon: 'i-lucide-log-out',
  },
  {
    title: 'Emergency',
    description: 'Phone numbers, medical help and urgent contacts.',
    icon: 'i-lucide-siren',
  },
  {
    title: 'Apartment Guide',
    description: 'Heating, appliances, recycling, TV and useful notes.',
    icon: 'i-lucide-house',
  },
  {
    title: 'Local Guide',
    description: 'Nearby shops, transport, food and activities.',
    icon: 'i-lucide-map',
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
  description: 'Turn house manuals into digital stay companions with a guest URL, QR code and host console.',
})
</script>
