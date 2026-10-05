# Industry and Capability Research context

Updated: 2026-10-05
Ref: a2bd21763
Role: living context
Scope: FireUX AI research method and its explicit consumers

## Purpose and inheritance

Inherit [AGENTS.md](../../../../../AGENTS.md) and the
[global context](../../../../../docs/ai/gpt-context.md). Use this entrypoint for
recurring industry research, capability discovery and reconciliation work.
The method is a base to improve through evidence, not a fixed industry blueprint.

## Scope and ownership

FireUX AI owns the reusable public method in
[`readIndustryResearchContext`](../../src/runtime/utils/industry-research-context.ts).
FireUX App publishes that source at `/context/research` and
`/api/fireux/context/research`; its page offers the instruction for explicit reuse.
Neither this Markdown guide nor an arbitrary repository directory is injected
into model requests. Consumers must select and supply the relevant runtime
context. The current consumer is a public context page and JSON endpoint;
automated browsing, research generation and saving are separate execution work.

Core owns the research data contract and shared review pages. Each App owns its
industry scope, source observations, interpretations and capability decisions.
Capability definitions describe target purpose, managed and referenced information,
bounded tool designs and responsibility boundaries, with a separate possible
service use case. They do not establish storage schemas, shipped actions or
released services. Current implementation assessments remain independent.
Delivery briefs in the shared capability review name the first journey's purpose,
pages, tools, trusted service owners, acceptance criteria and remaining gaps.
They are planning and source-review data, not an execution registry or persisted
proof. Optional configuration maps name existing settings, their capability
owners, editing tools and source paths. They do not create a configuration store. Planned and disabled pages do not become navigation links. Live proof
remains pending until actual operator/customer acceptance is recorded.
Related research may concern an entity that is not enabled in that App's runtime.
A package research guide does not become a central industry catalogue. The
shared Core review UI separates the summary, capability explorer, current build
and Workspace concept. Evidence, job and tool stages use progressive disclosure;
search and selection are local reading state and reset when the research subject
changes. Full provenance, limitations and technical assessments remain available
in details. Plain-language labels do not change the stored research statuses.

## Authority and working method

Read the public method, the consuming App's research and current owning source
before revising a brief. Preserve the evidence-to-job-to-tool-to-capability chain.
Use the method's independent market confidence, validation priority and
implementation assessment fields. Keep client-delivery commitments separate
from industry validation. Product scope and acceptance belong to the human;
command and data authority stay with existing domain owners.

Documents and public context contain no credentials, private operational records
or chat history. A source URL is not proof that its contents were inspected.
Unavailable browsing or code access must remain an explicit verification limit.
Published context and proposed capabilities grant no execution permission.

## Current source and proving examples

- [Research contract and reference validation](../../../../../packages/core/fireux-core/src/config/app/search-demand.ts)
- [Shared research pages](../../../../../packages/core/fireux-core/src/runtime/pages/search-demand)
- [Project research](../../../../../projects/fireux/fireux-app/app/search-demand.ts)
- [Kitchen research](../../../../../projects/misebox/misebox-app/app/search-demand.ts)
- [Supplier research](../../../../../projects/misebox/misebox-app/app/search-demand/supplier.ts)
- [Portfolio research](../../../../../projects/granite/granite-app/app/search-demand.ts)
- [Property research](../../../../../projects/buenohost/buenohost-app/app/search-demand.ts)
- [Public context API](../../../../../projects/fireux/fireux-app/server/api/fireux/context/research.get.ts)
- [Public context page](../../../../../projects/fireux/fireux-app/app/pages/context/research.vue)

These are independent examples, not required feature lists for new industries.

## Refresh and verification

When a brief changes, recheck the sources actually used and the owning installed
implementation. Retain original observation dates; append new observations rather
than presenting historical findings as a fresh study. Validate source identities,
job/tool/capability references, source paths and first-proof acceptance scope.

Use the source-owned [research tests](../../../../../packages/core/fireux-core/src/test/app-research.test.mjs)
and [context tests](../../src/test/research-context.test.mjs), plus appropriate
consumer typechecks and a visual check when the public presentation changes.
Do not make live model requests merely to verify static context.

## Living-context maintenance

Update the runtime method and relevant context together when stable research
ownership or procedure changes. Keep this guide as a source router and explain
consumption boundaries; do not copy the runtime instruction into it. Improve the
method when new industries expose missing distinctions, weak evidence or
unnecessary ceremony. Keep temporary task progress and speculative plans out
of this file. Update global context only for changes that also affect repo-wide
rules, and keep the scope router solely in root `AGENTS.md`.
