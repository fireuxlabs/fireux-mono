# FireUX Places Extension

A shared FireUX extension for managing real-world locations, addresses, and geodata that connect to users, jobs, and organizations across the ecosystem.

---

## Audience

Developers and app tenants who need structured place data for features like job locations, kitchen addresses, or client sites.

---

## Purpose

The Places Extension standardizes how FireUX apps store, search, and link physical locations.
It ensures every address in the ecosystem — from a restaurant to a cleaning site — can be verified, mapped, and connected to users or jobs.

---

## Key Features

- Global “Places” collection shared across tenants
- Autocomplete and prefix search for business names and addresses
- Geolocation and map pinning support
- Linking system to attach places to jobs, kitchens, or clients
- Basic verification for existing businesses (via email or domain)
- Optional logo and photo uploads for organization profiles
- Reusable composables for reading and querying locations

---

## Main Pages / Routes

- `/places` – explore and search verified places
- `/places/[id]` – view or manage a specific location
- `/places/new` – add a new business, venue, or address
- `/places/map` – view all locations on a map

---

## Next Steps

- Add reverse geocoding to auto-fill addresses
- Enable business verification flow with optional confirmation link
- Connect verified places directly to the Jobs and Misebox systems
- Build map filtering by category (e.g., kitchens, clients, venues)
- Implement organization invites from within place profiles

---

## Summary

The FireUX Places Extension keeps every real-world location consistent across the platform.
From kitchens to cleaning sites, it forms the backbone of how FireUX connects users, jobs, and companies in physical space.
