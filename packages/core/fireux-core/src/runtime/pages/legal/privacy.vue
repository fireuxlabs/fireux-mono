<!-- FILE: packages/core/fireux-core/src/runtime/pages/legal/privacy.vue -->
<template>
  <UPage>
    <UPageHeader
      title="FireUX Privacy Policy"
      description="How FireUX collects, uses, and protects your information across every FireUX-powered app."
    />

    <UPageBody class="space-y-8">
      <p class="text-sm text-gray-500">Last updated: November 29, 2025</p>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">1. Introduction</h2>
        <p>
          This Privacy Policy explains how FireUX (“we”, “us”, “our”) collects,
          uses, and protects your personal information when you use FireUX or
          any application built on the FireUX platform. This policy applies to
          FireUX Core, all FireUX-branded applications (e.g., Misebox,
          Cleanbox), and tenant apps that run on FireUX infrastructure.
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
        <h3 class="text-base font-semibold">
          2.2 Automatically Collected Information
        </h3>
        <p>We may collect:</p>
        <ul class="list-disc space-y-1 pl-6">
          <li>Device and browser details</li>
          <li>IP address</li>
          <li>Login timestamps</li>
          <li>Event logs</li>
          <li>Usage analytics (aggregated and anonymised where possible)</li>
        </ul>
        <h3 class="text-base font-semibold">2.3 Data From Firebase</h3>
        <p>
          Because FireUX uses Firebase services, authentication and certain
          profile metadata are stored through Firebase Authentication and
          Firestore.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">3. How We Use Your Data</h2>
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
          4. Legal Basis for Processing (GDPR)
        </h2>
        <p>If you are in the EEA or UK, our legal basis includes:</p>
        <ul class="list-disc space-y-1 pl-6">
          <li>Legitimate interests: providing platform functionality</li>
          <li>Contract necessity: providing services you sign up for</li>
          <li>Consent: where explicitly required (e.g., newsletters)</li>
        </ul>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">5. Sharing Your Information</h2>
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
        <h2 class="text-lg font-semibold">6. Data Storage & Security</h2>
        <p>
          Your data is stored in Firebase (Google Cloud). We apply encryption,
          access controls, role-based permissions, audit logs, and data
          minimisation practices. No system is perfectly secure, but we do our
          best to protect your information.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">7. Your Rights</h2>
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
        <h2 class="text-lg font-semibold">8. Data Retention</h2>
        <p>
          We retain data for as long as needed to provide our services. You may
          request account deletion at any time.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">9. Age Requirements</h2>
        <p>
          FireUX is intended for users 16+ unless local laws require a higher
          minimum age.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">10. Changes to This Policy</h2>
        <p>
          We may update this policy as the platform evolves. Continued use of
          FireUX after changes constitutes acceptance.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">11. Contact</h2>
        <p>
          For questions or privacy requests, contact:
          <a href="mailto:fire@fireux.app">fire@fireux.app</a>.
        </p>
      </section>
    </UPageBody>
  </UPage>
</template>
