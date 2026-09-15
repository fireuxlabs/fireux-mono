<template>
  <UContainer class="pb-16 sm:pb-24">
    <section class="explore-hero" aria-labelledby="explore-title">
      <div class="explore-copy">
        <h1
          id="explore-title"
          class="text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl lg:text-8xl"
        >
          Projects
        </h1>
        <p class="mt-7 max-w-lg text-lg leading-relaxed text-stone-300">
          Create a Project. Manage its Apps and Team.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <UButton
            to="/workspace/project"
            size="xl"
            color="neutral"
            trailing-icon="i-lucide-arrow-up-right"
            class="rounded-full bg-amber-300 px-6 text-stone-950 hover:bg-amber-200"
            >Open Project Workspace</UButton
          >
          <UButton
            to="/apps"
            size="xl"
            color="neutral"
            variant="link"
            trailing-icon="i-lucide-arrow-down"
            class="text-white"
            >View Apps</UButton
          >
        </div>
      </div>
      <div class="explore-art" aria-hidden="true">
        <div class="explore-ring explore-ring--outer" />
        <div class="explore-ring explore-ring--inner" />
        <div class="explore-brand"><img src="/img/app/logo.png" alt="" /></div>
        <span class="explore-orbit-label explore-orbit-label--apps"
          ><UIcon name="i-lucide-app-window" /> Apps</span
        ><span class="explore-orbit-label explore-orbit-label--ideas"
          ><UIcon name="i-lucide-users" /> Teams</span
        ><span class="explore-orbit-label explore-orbit-label--projects"
          ><UIcon name="i-lucide-box" /> Projects</span
        >
      </div>
      <div
        class="explore-footer relative mt-14 flex items-center justify-between gap-4 border-t border-white/20 pt-5 text-sm text-stone-400"
      >
        <span>FireUX</span
        ><UButton
          to="/workspace/project"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-arrow-up-right"
          class="text-stone-200"
          >Project Workspace</UButton
        >
      </div>
    </section>

    <section
      id="possibilities"
      class="scroll-mt-24 pt-14 sm:pt-20"
      aria-labelledby="possibilities-title"
    >
      <div class="mb-8">
        <p
          class="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted"
        >
          FireUX
        </p>
        <h2
          id="possibilities-title"
          class="text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Apps and tools
        </h2>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <NuxtLink
          v-for="(path, index) in paths"
          :key="path.to"
          :to="path.to"
          class="group flex min-h-60 flex-col border-t border-default py-7 px-2 transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <div class="mb-7 flex items-center justify-between">
            <span class="text-xs tabular-nums text-muted">0{{ index + 1 }}</span
            ><UIcon :name="path.icon" class="size-7 text-primary" />
          </div>
          <h3 class="text-2xl font-semibold tracking-tight">
            {{ path.title }}
          </h3>
          <p class="mt-3 flex-1 leading-relaxed text-muted">
            {{ path.description }}
          </p>
          <span
            class="mt-7 flex items-center justify-between text-sm font-medium"
            >{{ path.action
            }}<UIcon name="i-lucide-arrow-up-right" class="size-5"
          /></span>
        </NuxtLink>
      </div>
    </section>
    <section
      class="mt-14 flex flex-col gap-8 rounded-2xl bg-elevated p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12"
    >
      <div>
        <p
          class="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted"
        >
          Project Workspace
        </p>
        <h2 class="text-3xl font-semibold tracking-tight">
          Manage your Project.
        </h2>
        <p class="mt-3 max-w-lg leading-relaxed text-muted">
          Create or select a Project to manage its Apps and Team.
        </p>
      </div>
      <UButton
        to="/workspace/project"
        size="xl"
        trailing-icon="i-lucide-arrow-up-right"
        class="shrink-0 rounded-full px-6"
        >Open Project Workspace</UButton
      >
    </section>
  </UContainer>
</template>

<script setup lang="ts">
const paths = [
  {
    title: 'Apps',
    description: 'View Apps on FireUX.',
    action: 'View Apps',
    icon: 'i-lucide-app-window',
    to: '/apps',
  },
  {
    title: 'Solutions',
    description: 'View supported uses for FireUX Apps.',
    action: 'View solutions',
    icon: 'i-lucide-compass',
    to: '/solutions',
  },
  {
    title: 'FireUX',
    description: 'Read about FireUX features and tools.',
    action: 'View features',
    icon: 'i-lucide-blocks',
    to: '/product',
  },
]
</script>

<style scoped>
.explore-hero {
  position: relative;
  isolation: isolate;
  margin-top: 1rem;
  padding: 4rem 0 1rem;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  min-height: 600px;
}
.explore-copy {
  position: relative;
  z-index: 2;
}
.explore-copy h1 {
  font-size: clamp(3.8rem, 7vw, 6.5rem);
  line-height: 0.96;
  letter-spacing: -0.065em;
}
.explore-copy p:not(:first-child) {
  color: var(--ui-text-muted);
}
.explore-copy :deep(a.text-white) {
  color: var(--ui-text-highlighted);
}
.explore-art {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  height: 520px;
  overflow: hidden;
}
.explore-footer {
  grid-column: 1 / -1;
  border-color: var(--ui-border);
}
.explore-footer :deep(a) {
  color: var(--ui-text-highlighted);
}
.explore-ring {
  position: absolute;
  width: 90%;
  aspect-ratio: 1;
  border: 1px solid var(--ui-border-accented);
  border-radius: 50%;
  transform: rotateX(20deg) rotate(-25deg);
}
.explore-ring--inner {
  width: 66%;
  border-style: dashed;
  opacity: 0.6;
}
.explore-brand {
  width: 48%;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border: 1px solid var(--ui-border-accented);
  border-radius: 28%;
  background: var(--ui-bg-elevated);
  box-shadow: 0 30px 70px #0003;
  transform: rotate(-10deg);
}
.explore-brand img {
  width: 75%;
  height: 75%;
  object-fit: contain;
}
.explore-orbit-label {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: 1rem;
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  box-shadow: 0 12px 30px #0002;
  font-size: 0.85rem;
}
.explore-orbit-label--apps {
  top: 15%;
  right: 7%;
  transform: rotate(6deg);
}
.explore-orbit-label--ideas {
  bottom: 23%;
  left: 0;
  transform: rotate(-7deg);
}
.explore-orbit-label--projects {
  bottom: 7%;
  right: 13%;
  transform: rotate(4deg);
}
@media (max-width: 64rem) {
  .explore-hero {
    grid-template-columns: 1fr;
    padding-top: 3rem;
  }
  .explore-art {
    height: 380px;
    margin-top: 1.5rem;
  }
  .explore-footer {
    margin-top: 0;
  }
}
</style>
