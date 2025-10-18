# FireUX Core

The foundation of the FireUX ecosystem — a shared codebase, design system, and runtime for building connected SaaS applications.

---

## Audience

Developers, designers, and entrepreneurs who want to build, host, or customize multi-tenant web apps.

---

## Purpose

FireUX Core provides the tools, components, and logic that every FireUX app depends on.
It connects Nuxt 4, Firebase, and Stripe into one reusable system — letting anyone create new apps (like Misebox or Cleanbox) without rebuilding the basics each time.

---

## Key Features

- Unified Nuxt 4 + Firebase architecture
- Authentication and Firestore composables
- Shared design system (UI + theme tokens)
- Tenant-aware white-label runtime
- Stripe-ready billing logic
- Built-in PWA and CI deployment presets
- Cross-app login and analytics layer

---

## Main Pages / Routes

- `/developers` – documentation and onboarding
- `/get-started` – quick setup for new tenants
- `/projects` – showcase of apps built on FireUX

---

## Next Steps

- Write clear onboarding docs for new developers
- Finalize API references for composables (useAuth, useFirestoreRead, etc.)
- Add automated tests for tenant switching
- Prepare SDK documentation for external builders
- Publish the FireUX Developer Portal

---

## Summary

FireUX Core is the "engine" that powers every other tenant.
Once this layer is stable and documented, Misebox, Cleanbox, and future apps can all scale from a single, shared foundation.
