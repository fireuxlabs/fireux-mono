<!-- FILE: packages/core/fireux-core/src/runtime/pages/legal/privacy.vue -->
<!-- Privacy measurement canon: disclose essential storage and the no-tracking boundary truthfully. -->
<template>
  <UPage>
    <UPageHeader
      title="FireUX Privacy Policy"
      description="How FireUX collects, uses, and protects your information across every FireUX-powered app."
    />

    <UPageBody class="pagebody">
      <p class="text-sm text-muted">Last updated: July 29, 2026</p>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">1. Introduction</h2>
        <p>
          This Privacy Policy explains how FireUX (“we”, “us”, “our”) collects,
          uses, and protects your personal information when you use FireUX or
          any application built on the FireUX platform. This policy applies to
          FireUX Core, all FireUX-branded applications (e.g., Misebox,
          Werkbox), and tenant apps that run on FireUX infrastructure.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">2. Information We Collect</h2>
        <h3 class="text-base font-semibold">2.1 Information You Provide</h3>
        <p>When creating or using an account, you may provide:</p>
        <ul class="list-disc space-y-1 pl-6">
          <li>Email address</li>
          <li>Display name</li>
          <li>Avatar</li>
          <li>Profile information</li>
          <li>Job or professional data</li>
          <li>Any data you add to FireUX-powered apps</li>
        </ul>
        <h3 class="text-base font-semibold">2.2 Operational information</h3>
        <p>
          Our infrastructure may process limited technical information needed
          to deliver and secure a request:
        </p>
        <ul class="list-disc space-y-1 pl-6">
          <li>Security and authentication events</li>
          <li>Service errors and request timestamps</li>
          <li>
            Network information processed transiently by hosting providers for
            delivery, abuse prevention, and security
          </li>
        </ul>
        <h3 class="text-base font-semibold">2.3 Data From Firebase</h3>
        <p>
          Because FireUX uses Firebase services, authentication and certain
          profile metadata are stored through Firebase Authentication and
          Firestore.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">
          3. Cookies, local storage, and measurement
        </h2>
        <p>
          FireUX and Misebox apps do not use analytics or advertising cookies,
          cross-site identifiers, device fingerprints, or third-party
          behavioural tracking. We do not use Google Analytics, Meta Pixel, or
          comparable ad-tech. Because analytics does not place or read tracking
          storage, these apps do not show a cookie-consent popup.
        </p>
        <p>
          Some features use strictly necessary browser storage. Authentication
          providers may maintain sign-in and security state. A selected
          language may be remembered. An anonymous order may store a
          short-lived recovery capability so that the same browser can return
          to its order. These values provide the feature requested by the user;
          they are not read as analytics identifiers and are not joined into a
          behavioural profile.
        </p>
        <p>
          If aggregate operational measurement is introduced, it must remain
          first-party and server-side. It may count bounded events by day, app,
          route class, and low-cardinality campaign or referrer category. It
          must not retain names, contact or delivery details, order content,
          account identifiers, authentication tokens, raw IP addresses, or
          detailed user-agent strings, and it must not reconstruct individual
          journeys or profiles.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">4. How We Use Your Data</h2>
        <p>We use your information to:</p>
        <ul class="list-disc space-y-1 pl-6">
          <li>Provide authentication</li>
          <li>Power your user profile across FireUX apps</li>
          <li>Enable job posting and application systems</li>
          <li>Operate and secure the platform</li>
          <li>Improve FireUX features and performance</li>
          <li>Communicate account-related information</li>
        </ul>
        <p>FireUX does not sell your data.</p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">
          5. Legal Basis for Processing
        </h2>
        <p>
          Depending on where you are, applicable Swiss and European data
          protection law may require a legal basis for processing. Our bases
          include:
        </p>
        <ul class="list-disc space-y-1 pl-6">
          <li>Legitimate interests: providing platform functionality</li>
          <li>Contract necessity: providing services you sign up for</li>
          <li>Consent: where explicitly required (e.g., newsletters)</li>
        </ul>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">6. Sharing Your Information</h2>
        <p>We may share your data with:</p>
        <ul class="list-disc space-y-1 pl-6">
          <li>Firebase/Google Cloud (hosting & authentication)</li>
          <li>Tenant apps that you explicitly interact with</li>
          <li>Service providers assisting in platform operations</li>
          <li>Legal authorities, if required by law</li>
        </ul>
        <p>FireUX never sells your personal data.</p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">7. Data Storage & Security</h2>
        <p>
          Your data is stored in Firebase (Google Cloud). We apply encryption,
          access controls, role-based permissions, audit logs, and data
          minimisation practices. No system is perfectly secure, but we do our
          best to protect your information.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">8. Your Rights</h2>
        <p>Depending on jurisdiction, you may have rights to:</p>
        <ul class="list-disc space-y-1 pl-6">
          <li>Access your data</li>
          <li>Correct your data</li>
          <li>Delete your data</li>
          <li>Object to certain processing</li>
          <li>Export or transfer your data</li>
        </ul>
        <p>
          Requests can be sent to
          <a href="mailto:fire@fireux.app">fire@fireux.app</a>.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">9. Data Retention</h2>
        <p>
          We retain data for as long as needed to provide our services. You may
          request account deletion at any time.
        </p>
        <p>
          Security logs follow the retention configured by the relevant
          infrastructure provider. Any future aggregate operational
          measurements must expire after no more than 13 months. They may be
          deleted sooner and must never be converted into person-level history.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">10. Age Requirements</h2>
        <p>
          FireUX is intended for users 16+ unless local laws require a higher
          minimum age.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">11. Changes to This Policy</h2>
        <p>
          We may update this policy as the platform evolves. Continued use of
          FireUX after changes constitutes acceptance.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">12. Contact</h2>
        <p>
          For questions or privacy requests, contact:
          <a href="mailto:fire@fireux.app">fire@fireux.app</a>.
        </p>
      </section>
    </UPageBody>
  </UPage>
</template>
