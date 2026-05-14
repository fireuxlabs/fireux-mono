<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-12">
      <header class="flex items-center justify-between gap-4">
        <NuxtLink to="/" class="inline-flex items-center gap-3">
          <img src="/img/app/logo.png" alt="" class="size-10 rounded-xl" />
          <span class="text-lg font-semibold text-highlighted">BuenoHost</span>
        </NuxtLink>
        <UButton to="/bnb" icon="i-lucide-house" color="neutral" variant="soft">
          Guides
        </UButton>
      </header>

      <section class="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:py-20">
        <div class="space-y-8">
          <div class="space-y-4">
            <UBadge color="primary" variant="soft">
              Short-stay guest guides
            </UBadge>
            <h1 class="max-w-4xl text-4xl font-semibold tracking-normal text-highlighted sm:text-6xl">
              Airbnb support pages that guests actually use.
            </h1>
            <p class="max-w-2xl text-lg leading-8 text-muted">
              BuenoHost turns house manuals into clean mobile guides for Wi-Fi, keys, checkout,
              emergency contacts, parking, rules and local recommendations.
            </p>
          </div>

          <div class="grid gap-3 sm:flex sm:flex-wrap">
            <UButton to="/bnb/holiday-with-nats" icon="i-lucide-eye" size="xl" block class="sm:w-auto">
              View sample guide
            </UButton>
            <UButton to="/bnb" icon="i-lucide-list" size="xl" color="neutral" variant="soft" block class="sm:w-auto">
              Browse guides
            </UButton>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <UCard v-for="feature in features" :key="feature.title">
              <div class="space-y-3">
                <div class="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon :name="feature.icon" class="size-5" />
                </div>
                <h2 class="font-semibold text-highlighted">{{ feature.title }}</h2>
                <p class="text-sm leading-6 text-muted">{{ feature.copy }}</p>
              </div>
            </UCard>
          </div>
        </div>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <Icon name="i-lucide-calendar-heart" class="size-5 text-primary" />
              <h2 class="font-semibold">Stay-ready information</h2>
            </div>
          </template>

          <ul class="space-y-3 text-sm">
            <li v-for="item in checklist" :key="item" class="flex gap-3">
              <Icon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </UCard>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
const features = [
  {
    title: 'Clear arrivals',
    copy: 'Give guests the important details before they message the host.',
    icon: 'i-lucide-key-round',
  },
  {
    title: 'Fewer repeated questions',
    copy: 'Keep Wi-Fi, checkout, parking and rubbish instructions in one obvious place.',
    icon: 'i-lucide-message-circle-off',
  },
  {
    title: 'Translation-ready',
    copy: 'Sproochli can translate the structured guide when the host is ready.',
    icon: 'i-lucide-languages',
  },
]

const checklist = [
  'Emergency contacts and safety equipment',
  'Wi-Fi, keys, access and checkout',
  'House rules, quiet hours and smoking notes',
  'Parking, rubbish, recycling and local shops',
  'Personal host messages for each stay later',
]

useSeoMeta({
  title: 'BuenoHost - Guest guides for BNB and holiday apartment hosts',
  description:
    'Mobile guest guides for BNB and holiday apartment hosts with Wi-Fi, keys, checkout, emergency contacts, house rules and local information.',
})
</script>
