<template>
  <article class="fx-card-body-stack">
    <p class="fx-type-caption">Last updated: October 26, 2026</p>

    <section class="fx-card-body-stack">
      <h2 class="fx-type-card-heading">No tracking storage</h2>
      <p>
        FireUX does not use analytics or advertising identifiers, device
        fingerprints, or cross-App behavioural identity. An ordinary public
        visit does not need a consent popup because optional tracking is not
        active. Nuxt remembers the appearance preference automatically,
        initially following your device. Other feature storage begins when you
        ask an App to remember a choice, sign you in, enable offline support,
        retain a cart or order, or continue a conversation.
      </p>
    </section>

    <section class="fx-card-body-stack">
      <h2 class="fx-type-card-heading">
        Appearance and requested feature storage
      </h2>
      <UTable
        :data="storageRows"
        :columns="storageColumns"
        caption="Browser storage by feature, owner, purpose and lifetime"
      />
    </section>

    <section class="fx-card-body-stack">
      <h2 class="fx-type-card-heading">Third-party features</h2>
      <p>
        Google Maps loads only after you request a map. Stripe may use storage
        on its hosted checkout after you choose checkout. An embedded FireUX
        tool runs on its named provider App origin after you open that tool.
        Those providers control storage on their origins; FireUX prohibits
        joining it into cross-App behavioural profiles.
      </p>
    </section>

    <section class="fx-card-body-stack">
      <h2 class="fx-type-card-heading">Your controls</h2>
      <p>
        Open your browser menu and choose Install app or Add to Home Screen.
        Availability depends on your browser. Browser installation is separate
        from offline support; the install status below describes this browser
        window.
      </p>
      <FireDisclosurePanel
        title="Install and offline controls"
        description="Open app-specific browser settings"
        icon="i-lucide-smartphone"
      >
        <FirePwaControls />
      </FireDisclosurePanel>
      <p>
        Offline support is optional, and applying an available worker update
        deliberately reloads the page after you choose Update and reload.
      </p>
      <p>
        You can use the controls above or your browser's site-data controls.
        Blocking essential storage may prevent the requested feature from
        remembering its state. See the
        <NuxtLink to="/legal#privacy">Privacy Policy</NuxtLink> for
        personal-data handling, providers, rights, and contact details.
      </p>
    </section>
  </article>
</template>

<script setup lang="ts">
const storageColumns = [
  { accessorKey: 'feature', header: 'Feature' },
  { accessorKey: 'ownerAndPurpose', header: 'Owner and purpose' },
  { accessorKey: 'lifetimeAndDeletion', header: 'Lifetime and deletion' },
]

const storageRows = [
  {
    feature: 'Appearance',
    ownerAndPurpose: 'Nuxt remembers light, dark or System automatically.',
    lifetimeAndDeletion:
      'Until you clear site data. Selecting System remembers that the appearance should follow your device.',
  },
  {
    feature: 'Offline support',
    ownerAndPurpose:
      'After you enable it, Core remembers the choice for this App, registers its service worker and caches only a self-contained reconnect page. Live App pages, data, API responses, authentication state and queued writes are excluded.',
    lifetimeAndDeletion:
      'Until you disable offline support in the controls below or clear browser site data. Disabling removes the preference, unregisters the App worker and deletes its cache. Open pages may retain worker control until reloaded or closed; browsers may also evict cached content.',
  },
  {
    feature: 'Authentication',
    ownerAndPurpose:
      'Firebase maintains sign-in and security state for the current App. One-hour tab values can complete a requested sign-up redirect or transfer the selected anonymous Workspace target after sign-in.',
    lifetimeAndDeletion:
      'Across reloads and browser restarts until explicit sign-out or browser site-data removal. Temporary tab values are removed after completion or expiry.',
  },
  {
    feature: 'Language',
    ownerAndPurpose: 'The current App remembers the language you select.',
    lifetimeAndDeletion:
      'Up to one year. You can remove it with browser site-data controls.',
  },
  {
    feature: 'Workspace',
    ownerAndPurpose:
      'The current App remembers the authenticated Workspace source and target you select.',
    lifetimeAndDeletion: 'Browser session, or until the selection is cleared.',
  },
  {
    feature: 'Cart and anonymous order',
    ownerAndPurpose:
      'The ordering App retains cart lines, duplicate-submission protection, and the capability and receipt details needed to recover the order in this browser.',
    lifetimeAndDeletion:
      'At most 24 hours; removed when cleared, completed where applicable, or found expired.',
  },
  {
    feature: 'Chat',
    ownerAndPurpose: 'The current App remembers the conversation you started.',
    lifetimeAndDeletion:
      'At most 30 days; removed when found expired or through browser site-data controls.',
  },
]
</script>
