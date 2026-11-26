# FireUX — walking mode context recovery
2026-11-26. Request to the previous conversation: recover established canon, not redesign or implement it. Current implementation has not been audited.

## Part one — what we learned
- Architecture first, then systems, products and shipping; these are not literal deadlines. Architectural refinement has historically been valuable.
- Nuxt supplies application framework, Nuxt UI interface, Firebase backend, FireUX reusable UX/application architecture. Long-term developers should be able to build through FireUX without needing Nuxt knowledge. Industry ecosystems are extensions of the extension.
- Misebox (hospitality), Granite (property portfolio), BuenoHost (accommodation) are ecosystems, not merely apps. Reuse the highest appropriate abstraction; existing ecosystem products may already solve a client's problem.
- Project is a technical lens across apps in a Firebase project; ecosystem is a functional grouping of global and tenant apps. Do not conflate Firebase project with the Project entity in the FireUX app, currently understood as specific to that app.
- Global app usually named with -app (misebox-app); tenant apps have their own app identity and participate in the ecosystem (Bären). Standalone apps are the third classification, outside ecosystem participation, not necessarily outside its Firebase project. GoQR and Sproochli are examples; hypothetical foodtruck-app could read Misebox food truck kitchens and possibly share credentials without being a tenant. Standalones are edge cases handled individually, not a reason to overengineer.
- appId, ecosystemId and projectId were discussed; exact configuration contract remains unverified. The assistant proposed app configuration as the central point, but this is not confirmed canon.
- Inherit Firebase identity rather than invent per-app identity. Shared auth database does not guarantee shared anonymous session across domains/devices or permissions.
- Chef is being treated as a profile. Operational people may exist without accounts: Daisy and Joe can be scheduled and receive printed rotas, then later invited and linked to existing records to receive notifications. Both connected and unconnected cases must work. Temporary user shells were discussed; avoiding unnecessary Firebase accounts is an assistant proposal, not agreed implementation. Profiles/memberships deferred until app architecture is understood.
- Walking mode: short verbal exchanges, one concept at a time, no reliance on screen/code; consult GitHub via Bridge Connect where needed and publish handoffs for development agents. Distinguish discussion, agreement and implementation. End-of-walking-mode procedure still needs recovery.

## Part two — what we need to know
### Foundations
1. What is the highest-level architectural concept and central point (medulla oblongata) connecting Nuxt, Nuxt UI, Firebase and FireUX? Is it app, configuration, context, module, composable or something else?
2. What is FireUX's exact responsibility and established hierarchy of abstraction/reuse?
### App architecture
3. Canonical definition and minimum viable app? What does FireUX provide automatically? What belongs to app versus ecosystem extension?
4. How does initialization work? Established app composables, providers, contexts and configuration? Configuration versus runtime state?
5. Existing global/tenant/standalone contracts?
### Configuration
6. Actual config fields and exact meanings of appId, ecosystemId, projectId; required/optional/derived/inherited; where defined and consumed?
7. How does a tenant app identify ecosystem and tenant entity? Relationship between Firebase, Nuxt, Nuxt UI and FireUX configs? Source of truth for app identity?
### Project/ecosystem
8. Canonical definitions; purpose of FireUX Project entity versus Firebase project; how ecosystem extensions are structured and consumed; shared functionality; technical versus functional boundaries; standalone implementation?
### Identity (later)
9. Existing user architecture, Firebase-to-FireUX representation, anonymous/authenticated participation, distinctions between user/profile/entity/role/membership, unregistered operational people, Chef profile?
### Products/workspaces/entities (later)
10. Canonical product, workspace, workspace entity, tenant and app distinctions; relationships to ecosystem; entity families; boundary of app orchestration and entity responsibilities?
### Walking mode
11. Complete protocol, Bridge Connect usage, GitHub consultation, handoff timing, end-of-walking-mode procedure, continuity between discussion and implementation?
### Context recovery
12. What decisions, concepts and terminology are missing or incorrect here? Which proposals contradict canon? What should not be reopened? Correct top-down review order? Which repository files/packages/contracts should be consulted first?

## Requested return handoff
Please answer with established canon, current implementation, agreed but unimplemented direction, unresolved decisions, corrections and repository references. Prioritize top-level app architecture. Recover prior decisions rather than inventing new ones. No code changes requested. Publish a return handoff for the fresh conversation to retrieve.
