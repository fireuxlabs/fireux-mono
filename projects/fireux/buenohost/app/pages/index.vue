<template>
  <main class="buenohost-home min-h-screen bg-default text-default">
    <UContainer class="buenohost-shell py-8 sm:py-10">
      <header class="buenohost-topbar">
        <NuxtLink to="/" class="inline-flex items-center" aria-label="BuenoHost home">
          <img
            src="/img/app/wordmark-dark.png"
            alt="BuenoHost"
            class="h-12 w-auto dark:hidden"
          />
          <img
            src="/img/app/wordmark-light.png"
            alt="BuenoHost"
            class="hidden h-12 w-auto dark:block"
          />
        </NuxtLink>

        <nav class="flex items-center gap-2" aria-label="Primary">
          <UButton to="/bnb" icon="i-lucide-house" color="neutral" variant="ghost">
            Guides
          </UButton>
          <UButton to="/console/portfolio" icon="i-lucide-layout-dashboard" color="primary" variant="soft">
            Host dashboard
          </UButton>
        </nav>
      </header>

      <section class="buenohost-hero" aria-labelledby="buenohost-title">
        <div class="buenohost-hero__copy">
          <UBadge color="primary" variant="soft" size="lg">
            Guest guides for short stays
          </UBadge>

          <h1 id="buenohost-title" class="buenohost-title text-highlighted">
            House manuals guests can actually use.
          </h1>

          <p class="max-w-xl text-base leading-7 text-muted sm:text-lg">
            BuenoHost turns Wi-Fi, check-in, checkout, safety notes, parking and local tips into a polished mobile guide with a console shape ready behind it.
          </p>

          <nav class="grid gap-3 sm:grid-cols-3" aria-label="BuenoHost actions">
            <UButton
              v-for="action in actions"
              :key="action.to"
              :to="action.to"
              :icon="action.icon"
              size="xl"
              color="neutral"
              variant="ghost"
              block
              class="buenohost-action"
            >
              <span class="min-w-0 text-left">
                <span class="block truncate">{{ action.label }}</span>
                <span class="block text-xs font-normal opacity-85">{{ action.description }}</span>
              </span>
            </UButton>
          </nav>

          <div class="buenohost-proof" aria-label="BuenoHost workflow">
            <div v-for="step in workflow" :key="step.label" class="buenohost-proof__item">
              <Icon :name="step.icon" class="size-4" />
              <span>{{ step.label }}</span>
            </div>
          </div>
        </div>

        <div class="buenohost-hero__visual" aria-label="BuenoHost brand preview">
          <div class="buenohost-cover">
            <img
              src="/img/app/cover.png"
              alt="BuenoHost brand cover"
              class="aspect-video w-full object-cover"
            />
            <div class="buenohost-cover__shine" />
          </div>

          <div class="buenohost-stack">
            <div class="buenohost-logo-tile">
              <img
                src="/img/app/logo.png"
                alt="BuenoHost logo"
                class="size-full object-contain"
              />
            </div>

            <div class="buenohost-wordmark-tile">
              <img
                src="/img/app/wordmark.png"
                alt="BuenoHost wordmark"
                class="max-h-12 w-full object-contain"
              />
              <p class="text-sm leading-6 text-muted">
                Host information, guest-facing pages, console-ready data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="buenohost-branches" aria-labelledby="branches-title">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase text-primary">BuenoHost</p>
          <h2 id="branches-title" class="text-2xl font-semibold text-highlighted">
            Guest guide first, host dashboard next
          </h2>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <UButton
            v-for="action in actions"
            :key="action.to"
            :to="action.to"
            color="neutral"
            variant="ghost"
            block
            class="buenohost-branch"
          >
            <span class="grid w-full gap-3 text-left">
              <span class="buenohost-branch__icon">
                <Icon :name="action.icon" class="size-5" />
              </span>
              <span>
                <span class="block">{{ action.label }}</span>
                <span class="mt-1 block text-sm font-normal leading-6 opacity-80">
                  {{ action.longDescription }}
                </span>
              </span>
            </span>
          </UButton>
        </div>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'BuenoHost',
  description: 'Mobile guest guides and console-ready host information for holiday homes and BNBs.',
})

const actions = [
  {
    label: 'Demo guide',
    description: 'Guest-facing sample',
    longDescription: 'A demo-safe public BNB guide with Wi-Fi, access, checkout, safety and local information.',
    to: '/bnb/alpine-view-demo',
    icon: 'i-lucide-house',
  },
  {
    label: 'Guides',
    description: 'Public guide list',
    longDescription: 'Browse the available BuenoHost guide records before moving them into live host storage.',
    to: '/bnb',
    icon: 'i-lucide-list',
  },
  {
    label: 'Host dashboard',
    description: 'Host workspace',
    longDescription: 'A host dashboard route for managing properties, guest guides, stays, cleaning and issues.',
    to: '/console/portfolio',
    icon: 'i-lucide-layout-dashboard',
  },
]

const workflow = [
  {
    label: 'Property',
    icon: 'i-lucide-building-2',
  },
  {
    label: 'Guide',
    icon: 'i-lucide-layout-list',
  },
  {
    label: 'Publish',
    icon: 'i-lucide-send',
  },
  {
    label: 'Guest',
    icon: 'i-lucide-smartphone',
  },
]
</script>

<style scoped>
.buenohost-home {
  --buenohost-primary: #0f766e;
  --buenohost-secondary: #0891b2;
  --buenohost-accent: #f59e0b;
  --buenohost-dark: #0f172a;
}

.buenohost-shell {
  display: grid;
  gap: 4rem;
}

.buenohost-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.buenohost-hero {
  display: grid;
  align-items: center;
  gap: 2.5rem;
}

.buenohost-hero__copy,
.buenohost-hero__visual {
  display: grid;
  gap: 1.5rem;
  animation: buenohost-rise 520ms ease-out both;
}

.buenohost-hero__visual {
  animation-delay: 90ms;
}

.buenohost-title {
  max-width: 44rem;
  font-size: 3.75rem;
  font-weight: 650;
  letter-spacing: 0;
  line-height: 0.98;
}

.buenohost-action,
.buenohost-branch {
  min-height: 4.25rem;
  justify-content: flex-start;
  border: 0;
  background:
    linear-gradient(135deg, var(--buenohost-primary), var(--buenohost-secondary) 62%, var(--buenohost-accent));
  color: white;
  box-shadow: 0 18px 36px rgb(15 118 110 / 22%);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.buenohost-action:hover,
.buenohost-branch:hover {
  transform: translateY(-2px);
  filter: saturate(1.08);
  box-shadow: 0 22px 44px rgb(15 118 110 / 30%);
}

.buenohost-proof {
  display: grid;
  gap: 0.75rem;
  max-width: 42rem;
}

.buenohost-proof__item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.5rem;
  border: 1px solid color-mix(in srgb, var(--buenohost-primary) 20%, transparent);
  border-radius: 0.5rem;
  padding: 0.6rem 0.8rem;
  color: var(--buenohost-primary);
  background: color-mix(in srgb, var(--buenohost-primary) 8%, transparent);
  font-size: 0.875rem;
  font-weight: 650;
}

.buenohost-cover {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: var(--ui-bg-elevated);
  box-shadow: 0 24px 70px rgb(15 23 42 / 18%);
}

.buenohost-cover__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 24%, rgb(255 255 255 / 22%) 44%, transparent 62%);
  transform: translateX(-100%);
  animation: buenohost-shine 3.8s ease-in-out infinite;
}

.buenohost-stack {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  gap: 1rem;
}

.buenohost-logo-tile,
.buenohost-wordmark-tile {
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: var(--ui-bg-elevated);
}

.buenohost-logo-tile {
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  padding: 1rem;
  animation: buenohost-float 5.5s ease-in-out infinite;
}

.buenohost-wordmark-tile {
  display: grid;
  align-content: center;
  gap: 0.75rem;
  min-height: 7rem;
  padding: 1rem;
}

.buenohost-branches {
  display: grid;
  gap: 1.25rem;
}

.buenohost-branch {
  min-height: 11rem;
  align-items: stretch;
  padding: 1rem;
}

.buenohost-branch__icon {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: 0.5rem;
  background: rgb(255 255 255 / 16%);
}

@media (min-width: 640px) {
  .buenohost-proof {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .buenohost-hero {
    grid-template-columns: minmax(0, 1fr) minmax(22rem, 32rem);
  }
}

@media (max-width: 639px) {
  .buenohost-title {
    font-size: 2.75rem;
  }

  .buenohost-stack {
    grid-template-columns: 1fr;
  }

  .buenohost-logo-tile {
    width: 8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .buenohost-action,
  .buenohost-branch,
  .buenohost-cover__shine,
  .buenohost-hero__copy,
  .buenohost-hero__visual,
  .buenohost-logo-tile {
    animation: none;
    transition: none;
  }

  .buenohost-action:hover,
  .buenohost-branch:hover {
    transform: none;
  }
}

@keyframes buenohost-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes buenohost-shine {
  0%,
  42% {
    transform: translateX(-100%);
  }

  72%,
  100% {
    transform: translateX(100%);
  }
}

@keyframes buenohost-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}
</style>
