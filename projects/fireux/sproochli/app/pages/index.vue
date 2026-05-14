<template>
  <main class="sproochli-home min-h-screen bg-default text-default">
    <UContainer class="sproochli-shell py-8 sm:py-10">
      <header class="sproochli-topbar">
        <NuxtLink to="/" class="inline-flex items-center" aria-label="Sproochli home">
          <img
            src="/img/app/wordmark-dark.png"
            alt="Sproochli"
            class="h-12 w-auto dark:hidden"
          />
          <img
            src="/img/app/wordmark-light.png"
            alt="Sproochli"
            class="hidden h-12 w-auto dark:block"
          />
        </NuxtLink>

        <UButton to="/bnb" icon="i-lucide-house" color="neutral" variant="ghost">
          BNB
        </UButton>
      </header>

      <section class="sproochli-hero" aria-labelledby="sproochli-title">
        <div class="sproochli-hero__copy">
          <UBadge color="primary" variant="soft" size="lg">
            Multilingual QR pages
          </UBadge>

          <h1 id="sproochli-title" class="sproochli-title text-highlighted">
            Guest information that feels easy in every language.
          </h1>

          <p class="max-w-xl text-base leading-7 text-muted sm:text-lg">
            Sproochli turns house manuals, local instructions and read-only menus into polished public pages guests can open from a QR code.
          </p>

          <nav class="grid gap-3 sm:grid-cols-3" aria-label="Sproochli page types">
            <UButton
              v-for="action in actions"
              :key="action.to"
              :to="action.to"
              :icon="action.icon"
              size="xl"
              color="neutral"
              variant="ghost"
              block
              class="sproochli-action"
            >
              <span class="min-w-0 text-left">
                <span class="block truncate">{{ action.label }}</span>
                <span class="block text-xs font-normal opacity-85">{{ action.description }}</span>
              </span>
            </UButton>
          </nav>

          <div class="sproochli-proof" aria-label="Sproochli workflow">
            <div v-for="step in workflow" :key="step.label" class="sproochli-proof__item">
              <Icon :name="step.icon" class="size-4" />
              <span>{{ step.label }}</span>
            </div>
          </div>
        </div>

        <div class="sproochli-hero__visual" aria-label="Sproochli brand preview">
          <div class="sproochli-cover">
            <img
              src="/img/app/cover.png"
              alt="Sproochli brand cover"
              class="aspect-video w-full object-cover"
            />
            <div class="sproochli-cover__shine" />
          </div>

          <div class="sproochli-stack">
            <div class="sproochli-logo-tile">
              <img
                src="/img/app/logo.png"
                alt="Sproochli logo"
                class="size-full object-contain"
              />
            </div>

            <div class="sproochli-wordmark-tile">
              <img
                src="/img/app/wordmark.png"
                alt="Sproochli wordmark"
                class="max-h-12 w-full object-contain"
              />
              <p class="text-sm leading-6 text-muted">
                Built for guests first. Simple for hosts next.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="sproochli-branches" aria-labelledby="branches-title">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase text-primary">Branches</p>
          <h2 id="branches-title" class="text-2xl font-semibold text-highlighted">
            Start with the page type
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
            class="sproochli-branch"
          >
            <span class="grid w-full gap-3 text-left">
              <span class="sproochli-branch__icon">
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
  title: 'Sproochli',
  description: 'Simple public pages for BNB guides, information pages, and read-only menus.',
})

const actions = [
  {
    label: 'BNB',
    description: 'Guest guides for stays',
    longDescription: 'House manuals, arrival notes, Wi-Fi, checkout, safety and local tips.',
    to: '/bnb',
    icon: 'i-lucide-house',
  },
  {
    label: 'Info',
    description: 'Instructions and local pages',
    longDescription: 'Clear public pages for shops, rentals, notices and visitor information.',
    to: '/info',
    icon: 'i-lucide-info',
  },
  {
    label: 'Menus',
    description: 'Read-only translated menus',
    longDescription: 'A stepping stone for venues that need a translated QR menu before Misebox.',
    to: '/menus',
    icon: 'i-lucide-utensils',
  },
]

const workflow = [
  {
    label: 'Source',
    icon: 'i-lucide-file-text',
  },
  {
    label: 'Structure',
    icon: 'i-lucide-layout-list',
  },
  {
    label: 'Translate',
    icon: 'i-lucide-languages',
  },
  {
    label: 'QR',
    icon: 'i-lucide-qr-code',
  },
]
</script>

<style scoped>
.sproochli-home {
  --sproochli-primary: #6c3aed;
  --sproochli-secondary: #4828cc;
  --sproochli-accent: #ff5ca8;
  --sproochli-dark: #0f0f1a;
}

.sproochli-shell {
  display: grid;
  gap: 4rem;
}

.sproochli-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.sproochli-hero {
  display: grid;
  align-items: center;
  gap: 2.5rem;
}

.sproochli-hero__copy {
  display: grid;
  gap: 1.5rem;
  animation: sproochli-rise 520ms ease-out both;
}

.sproochli-title {
  max-width: 44rem;
  font-size: 3.75rem;
  font-weight: 650;
  letter-spacing: 0;
  line-height: 0.98;
}

.sproochli-action,
.sproochli-branch {
  min-height: 4.25rem;
  justify-content: flex-start;
  border: 0;
  background:
    linear-gradient(135deg, var(--sproochli-primary), var(--sproochli-secondary) 54%, var(--sproochli-accent));
  color: white;
  box-shadow: 0 18px 36px rgb(108 58 237 / 24%);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.sproochli-action:hover,
.sproochli-branch:hover {
  transform: translateY(-2px);
  filter: saturate(1.08);
  box-shadow: 0 22px 44px rgb(108 58 237 / 32%);
}

.sproochli-proof {
  display: grid;
  gap: 0.75rem;
  max-width: 42rem;
}

.sproochli-proof__item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.5rem;
  border: 1px solid color-mix(in srgb, var(--sproochli-primary) 20%, transparent);
  border-radius: 0.5rem;
  padding: 0.6rem 0.8rem;
  color: var(--sproochli-primary);
  background: color-mix(in srgb, var(--sproochli-primary) 8%, transparent);
  font-size: 0.875rem;
  font-weight: 650;
}

.sproochli-hero__visual {
  display: grid;
  gap: 1rem;
  animation: sproochli-rise 620ms 90ms ease-out both;
}

.sproochli-cover {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: var(--ui-bg-elevated);
  box-shadow: 0 24px 70px rgb(15 15 26 / 18%);
}

.sproochli-cover__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 24%, rgb(255 255 255 / 22%) 44%, transparent 62%);
  transform: translateX(-100%);
  animation: sproochli-shine 3.8s ease-in-out infinite;
}

.sproochli-stack {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  gap: 1rem;
}

.sproochli-logo-tile,
.sproochli-wordmark-tile {
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: var(--ui-bg-elevated);
}

.sproochli-logo-tile {
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  padding: 1rem;
  animation: sproochli-float 5.5s ease-in-out infinite;
}

.sproochli-wordmark-tile {
  display: grid;
  align-content: center;
  gap: 0.75rem;
  min-height: 7rem;
  padding: 1rem;
}

.sproochli-branches {
  display: grid;
  gap: 1.25rem;
}

.sproochli-branch {
  min-height: 11rem;
  align-items: stretch;
  padding: 1rem;
}

.sproochli-branch__icon {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: 0.5rem;
  background: rgb(255 255 255 / 16%);
}

@media (min-width: 640px) {
  .sproochli-proof {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .sproochli-hero {
    grid-template-columns: minmax(0, 1fr) minmax(22rem, 32rem);
  }
}

@media (max-width: 639px) {
  .sproochli-title {
    font-size: 2.75rem;
  }

  .sproochli-stack {
    grid-template-columns: 1fr;
  }

  .sproochli-logo-tile {
    width: 8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sproochli-action,
  .sproochli-branch,
  .sproochli-cover__shine,
  .sproochli-hero__copy,
  .sproochli-hero__visual,
  .sproochli-logo-tile {
    animation: none;
    transition: none;
  }

  .sproochli-action:hover,
  .sproochli-branch:hover {
    transform: none;
  }
}

@keyframes sproochli-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sproochli-shine {
  0%,
  42% {
    transform: translateX(-100%);
  }

  72%,
  100% {
    transform: translateX(100%);
  }
}

@keyframes sproochli-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}
</style>
