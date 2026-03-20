# CTA Report - FireUX

## Purpose

Define CTA families based on user intent, not UI implementation.

CTA = the entry point into a system capability.

We are aligning:
- what an entity is
- what the user needs to have
- what action the CTA should offer

---

# 1. PROFILE CTAs

## Entities
- Agent
- Chef
- Professional

## What they are
Extensions of the User identity.

They represent:
- a role
- a capability layer
- a way to participate in the ecosystem

## Requirements
- authenticated user
- no additional ownership required

## CTA behaviour
- if exists -> show profile preview
- primary -> View profile
- secondary -> Manage profile
- if missing -> Create profile

## Core intent
"Represent myself in this role"

---

# 2. CONSOLE SELECTOR CTAs

## Entities
- Kitchen
- Portfolio
- Project

## What they are
Operational environments with multiple runtimes.

They represent:
- a workspace
- an operational context
- a container for activity

## Requirements
- usually requires a profile (e.g. Chef for Kitchen)
- but may allow soft entry (e.g. test, read-only)

## CTA behaviour
- choose live runtime
- choose test runtime
- choose read-only runtime
- create if none exists
- enter console

## Core intent
"Operate within a system"

---

# 3. SINGLE CONSOLE CTA

## Entity
- Supplier

## What it is
A business workspace.

Unlike profiles:
- not just identity
- has operations (catalog, relationships, etc.)

Unlike selectors:
- only one workspace per user

## Requirements
- authenticated user
- supplier record (created if missing)

## CTA behaviour
- if exists -> enter console
- secondary -> view public supplier
- if missing -> create supplier

## Core intent
"Run my business"

---

# 4. USER CTA (CORE IDENTITY)

## Entity
- User

## What it is
The root identity of the system.

## Requirements
- none (entry point)

## CTA behaviour
- if signed in -> show user card / profile toggle
- if not -> create user

## Core intent
"Who am I in the system?"

---

# 5. SYSTEM NAVIGATION CTAs

## Entities
- App
- Ecosystem

## What they are
System-level navigation and structure.

## Requirements
- none specific

## CTA behaviour
- navigate collections
- open consoles
- learn system structure

## Core intent
"Navigate the system"

---

# 6. ENTITY INDEX CTAs

## Entities
- Company
- Product

## What they are
Browsable datasets.

Not identity.
Not console.
Not runtime.

## Requirements
- optional permissions for creation

## CTA behaviour
- browse collection
- create (if permitted)
- link to related systems

## Core intent
"Explore and manage records"

## Product note
Product spans two layers:
- Entity Index CTA = browse products
- permissioned create action inside that CTA

---

# 7. PERMISSIONED OPERATIONAL CTAs

## Entities
- Blog
- Ingredient
- Product create action

## What they are
Operational support and creation surfaces that are gated by permissions.

## Requirements
- admin or permission flag

## CTA behaviour
- show only if permitted
- provide creation tools
- otherwise hidden or read-only

## Core intent
"Perform privileged operational actions"

## Ingredient note
Ingredient is not just an admin action.

It is:
- a shared kitchen-support dataset
- used by runtime operations
- edited by admins

---

# 8. SYSTEM-BOUND CTAs

## Entities
- Recipe
- Dish
- Mise
- Eat

## What they are
Entities that only exist inside a console.

Not standalone entry points.

## Requirements
- must already be inside a runtime (e.g. kitchen)

## CTA behaviour
- minimal or none at index level
- guidance only

## Core intent
"Operate within an existing system"

## Recipe note
Recipe is not a standalone acquisition CTA.

It is:
- a registry inside a professional kitchen ecosystem
- currently chef-context first
- future-capable of branching into another ecosystem with another profile type

---

# 9. EXTERNAL-SOURCE CTAs

## Entity
- Place

## What it is
Data sourced from external APIs (Google Places).

## Requirements
- admin to avoid orphaned imports and duplicate source records

## CTA behaviour
- create via search/import
- confirm external data
- avoid duplication

## Core intent
"Import structured external data"

---

# 10. SPECIAL CASE NOTES

## Kitchen nuance
- technically can exist without chef
- but CTA should enforce chef profile
- prevents orphaned ownership

## Recipe nuance
- currently requires Chef (professional context)
- not for public/home use (yet)
- future-capable of branching into another ecosystem with another profile type

## Future idea
- "Home Cook" profile could exist
- but not part of Misebox (professional system)

---

# FINAL CTA FAMILY MAP

## Identity CTAs
- User
- Agent
- Chef
- Professional

## Single Console CTA
- Supplier

## Console Selector CTAs
- Kitchen
- Portfolio
- Project

## System Navigation CTAs
- App
- Ecosystem

## Entity Index CTAs
- Company
- Product

## Permissioned Operational CTAs
- Blog
- Ingredient
- Product create action

## System-bound CTAs
- Recipe
- Dish
- Mise
- Eat

## External-source CTAs
- Place

---

# KEY PRINCIPLE

Every CTA must answer:

1. What is this entity?
2. What does the user need to have?
3. What action should they take?

If those 3 are unclear, the CTA is wrong.
