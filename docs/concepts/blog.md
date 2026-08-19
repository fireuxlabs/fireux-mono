# Blog literature

Updated: 2026-08-19
Ref: 1114d407d
Role: map, not canon

## Purpose

Give FireUX BlogPosts a consistent editorial method without centralising their
authored content. This map inherits the bottom-up literature rule in
`docs/concepts/product-language.md`; current source, public projections, and
published posts remain authority.

## Editorial shape

Start with verified particulars: a person, place, date, product, action, or
invitation. Write the smallest complete story those facts support.

For short local posts:

- use one clear idea per paragraph;
- name real places, food, people, and times where they are known;
- prefer direct, conversational language over campaign language;
- let atmosphere come from observable details rather than adjectives;
- end with a useful invitation, question, or next action when one exists;
- omit unverified programme details, benefits, and promises.

Interlaken Essen authors first in readable Berner Oberland Swiss German. The
dialect should sound local without becoming theatrical or difficult to read.
Approved translations preserve the facts, paragraph rhythm, and invitation;
they do not translate spelling literally or add meaning.

Tense follows the subject. Product capabilities remain present-tense under the
product-language rule. An event preview uses future tense, while a report uses
past tense. Dates and programme details must be checked before publication.

## Learning articles and private sources

A private brief is source material, never public copy. Extract the transferable
lesson and make it understandable without the original email, calendar,
account, client, or unfinished-work context. Skip publication when no useful
standalone lesson remains.

Use the smallest format that completes the reader's job:

- field note: 300–500 words for one bounded discovery;
- learning article: 700–1,200 words for a reusable design or development lesson;
- deep dive: 1,400–2,200 words only when examples and technical detail support it.

Word ranges guide editing; they never justify padding. A learning article ends
with practical guidance for the reader and the concrete FireUX response when
one exists. Titles normally stay between 40 and 70 characters and meta
descriptions between 120 and 170 characters, but factual clarity remains the
stronger requirement.

## Editorial privacy and approval

AI-assisted work starts as a draft. Before publication, remove personal,
client, account, security, scheduling, private-link, credential, and private
message details. Treat every person, client, and project name as private unless
its publication is explicitly approved.

The authoring workflow blocks obvious email addresses, credentials, and
private URLs. Pattern checks cannot decide whether a name or commercial fact
is public, so the publishing admin must separately confirm privacy, factual
claims, and every remaining name. A scheduled run may produce no article;
skipping is a valid editorial outcome.

The FireUX App also has a local operational publisher for reviewed Markdown
drafts. It is a second transport into the same Blog-owned contract, not another
storage or publication authority: it fixes the FireUX Project and named
database, uses a create-only typed MCP/Skill target, plans without writing,
requires the plan hash plus all three editorial approvals, rejects collisions,
and verifies each public record after creation. Use
`pnpm publish:fireux-blog -- --project=fireux-2005 --database=fireux --files=<draft.md>`
to produce a plan; applying additionally requires `--apply`, the reported
`--confirm` hash, and `--privacy-reviewed --facts-reviewed --names-approved`.

## Ownership and boundaries

- `fireux-blogs` owns canonical BlogPost shape, storage, projection, and
  Sproochli attachment.
- The source App owns the authored story and its review.
- A tenant feed may reference a canonical post by slug; it does not copy the
  title, body, translation, or media.
- Durable Blog media uses HTTPS Storage URLs. Artwork may establish a visual
  family, but it must not introduce factual claims absent from the article.
- Temporary research, event notes, drafts, and one-off style decisions do not
  belong in this map.

## Current sources and exemplars

- `packages/extensions/fireux-blogs/src/runtime/models/blogPost.model.ts`
- `packages/extensions/fireux-blogs/src/runtime/server/utils/blog/public-projection.ts`
- `projects/misebox/interlaken-essen/app/content/futter.ts`
- `scripts/guards/blog-authority.mjs`
- `packages/extensions/fireux-blogs/src/runtime/utils/editorial-review.ts`
- `scripts/publish-fireux-blog.mjs`
- `scripts/guards/sproochli-copy.mjs`
- `docs/concepts/product-language.md`
- `docs/concepts/translation.md`
- Published Interlaken Essen posts under `/blog`

## Refresh and verification

Review this map when Blog ownership, translation review, feed composition, or
the recurring editorial method changes. Do not update it for a single event.
Before publishing, verify source facts, validate the canonical model fields,
run the Blog authority and relevant copy guards, and inspect every approved
language through the public projection.
