<template>
  <UPage>
    <UPageHeader
      title="Cookies and browser storage"
      description="The exact browser storage used by FireUX-powered apps and when it begins."
    />
    <UPageBody class="pagebody">
      <p class="text-sm text-muted">Last updated: August 3, 2026</p>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">No tracking storage</h2>
        <p>
          FireUX does not use analytics or advertising identifiers, device
          fingerprints, or cross-App behavioural identity. An ordinary public
          visit does not need a consent popup because optional tracking is not
          active. Storage begins only when you ask an App to remember a choice,
          sign you in, retain a cart or order, or continue a conversation.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Storage used after a feature request</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead><tr><th>Feature</th><th>Owner and purpose</th><th>Lifetime and deletion</th></tr></thead>
            <tbody>
              <tr><td>Appearance</td><td>Core remembers light or dark after you select it.</td><td>Until you select System or clear site data. Selecting System removes it.</td></tr>
              <tr><td>Authentication</td><td>Firebase maintains sign-in and security state for the current App. A one-hour tab value can complete a requested sign-up redirect.</td><td>Current browser session. Sign-out or ending the browser session clears local sign-in state; the redirect value is removed after completion or expiry.</td></tr>
              <tr><td>Language</td><td>The current App remembers the language you select.</td><td>Up to one year. You can remove it with browser site-data controls.</td></tr>
              <tr><td>Console</td><td>The current App remembers the authenticated Console source and target you select.</td><td>Browser session, or until the selection is cleared.</td></tr>
              <tr><td>Cart and anonymous order</td><td>The ordering App retains cart lines, duplicate-submission protection, and the capability and receipt details needed to recover the order in this browser.</td><td>At most 24 hours; removed when cleared, completed where applicable, or found expired.</td></tr>
              <tr><td>Chat</td><td>The current App remembers the conversation you started.</td><td>At most 30 days; removed when found expired or through browser site-data controls.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Third-party features</h2>
        <p>
          Google Maps loads only after you request a map. Stripe may use storage
          on its hosted checkout after you choose checkout. An embedded FireUX
          tool runs on its named provider App origin after you open that tool.
          Those providers control storage on their origins; FireUX prohibits
          joining it into cross-App behavioural profiles.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Your controls</h2>
        <p>
          You can use the feature controls described above or your browser's
          site-data controls. Blocking essential storage may prevent the
          requested feature from remembering its state. See the
          <NuxtLink to="/legal/privacy">Privacy Policy</NuxtLink> for personal-data
          handling, providers, rights, and contact details.
        </p>
      </section>
    </UPageBody>
  </UPage>
</template>
