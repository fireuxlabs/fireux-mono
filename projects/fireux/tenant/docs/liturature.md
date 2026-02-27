# FireUX Tenant

A shared runtime environment for hosted FireUX applications.
Each tenant (like Misebox or Cleanbox) runs on this structure, ensuring consistent authentication, theming, and deployment across the ecosystem.

---

## Audience

Developers and businesses hosting apps through the FireUX platform.

---

## Purpose

The FireUX Tenant project provides a standardized Nuxt + Firebase + Stripe setup that all tenants inherit.
It handles user sessions, tenant configuration, and environment variables while keeping every brand distinct through white-label overrides.

---

## Key Features

- Multi-tenant configuration system (theme, domain, branding)
- Shared authentication and cross-tenant user sessions
- Stripe integration for per-tenant billing
- Automatic Firebase deployment presets
- Theme variables and logo overrides for each tenant
- PWA and CI/CD ready out of the box
- Shared error handling, analytics, and legal pages

---

## Main Pages / Routes

- `/auth` – login, register, reset password
- `/console` – default tenant home page
- `/settings` – account and subscription management
- `/about` – tenant-specific info page
- `/legal` – privacy, terms, and cookie policy

---

## Next Steps

- Improve tenant configuration via Firestore (theme + copy)
- Add multi-language support for global tenants
- Create a CLI command to generate new tenant shells
- Finalize automated billing through Stripe subscriptions
- Write full documentation for tenant developers

---

## Summary

The FireUX Tenant project is the bridge between FireUX Core and each hosted brand.
It ensures every app — from Misebox to Cleanbox — runs securely, efficiently, and with its own visual identity, all powered by one centralized system.
