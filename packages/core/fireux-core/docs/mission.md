# FIReUX – Platform & Core

## Mission

Provide a universal, multi-tenant SaaS framework with shared UI, auth, Firestore utilities, and a simple pattern for defining your own entities (profiles, jobs, places, etc.) with minimal boilerplate.

## Profile-Agnostic, Profile-Ready

- FIReUX does not ship an opinionated profile module.
- Instead, it offers a repeatable pattern:
  - define a model,
  - wire a CRUD composable,
  - add one or two pages.
- Following that recipe promotes any entity to a first-class citizen in your app.
- You can register multiple entity types—profiles, kitchens, jobs, checklists, suppliers—using the same workflow.

> "Create a model + CRUD composable + a couple of pages = you’ve got a full entity in the system. Repeat for as many entities as you like."