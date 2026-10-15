# Blog literature

Updated: 2026-10-03
Ref: 2807ceca9
Role: map, not canon

## Purpose

Give FireUX BlogPosts a consistent editorial method without centralising their
authored content. This map inherits the bottom-up literature rule in
`docs/concepts/product-language.md`; current source, directory/detail reads, and
published posts remain authority.

## Implementation owner

BlogPost implementation lives beneath `fireux-blogs/src/runtime/blog` by
technical role. Root Nuxt pages and server HTTP handlers are thin entrypoints;
explicit module registration preserves the existing Blog component names.
Create, update and publication use the named `blog/server/authoring.ts` workflow.
Its writing transaction requires the current App and current admin/dev
membership, fixes source App and audit stamps, and rejects another App's post.
Public directory/detail projections remain separate from protected authoring.
Client commands copy original input before credentials and verify exact App/slug
responses. A committed result stays truthful after context changes; current UI
predicates own messages, navigation and draft resets. Review and approval remain
part of the editorial workflow, not a permission granted by reading this map.

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

The former local `publish:fireux-blog` publisher and MCP/Skill write adapters
were removed. There is no supported replacement CLI or MCP/Skill writer in the repository;
the consumed admin UI uses named trusted HTTP commands.
The Blog admin editor at `/dashboard/admin/blogs/[slug]` loads the existing
record live and saves original-language prose through `useBlogUpdate`. Admins
can enter it from the public post's Edit action. It preserves the slug, author,
publication settings, images and translations, requires fresh editorial checks,
and offers an isolated preview. It detects observed changes while editing;
the existing update command does not provide atomic conflict resolution.
Translations need their own review after a source edit. The editor currently
accepts HTML source rather than providing a rich-text editing toolbar.

An authored draft is not a published update. Preserve the draft if an authorized
admin session is unavailable; do not bypass the mutation authority boundary with
an arbitrary database write.

## Future audience evidence

Blog audience counts are `to-confirm` and must not introduce a Blog-local
tracking system. Revisit them only after the shared privacy-first measurement
family in `privacy-measurement.md` exists and deliberately permits the required
projection.

The preferred presentation is:

- an authorized FireUX developer or Blog admin may see the exact aggregate;
- a public reader may see the exact aggregate only at 100 views or more;
- a smaller public aggregate may display `<100 views`;
- absent or unavailable measurement displays nothing rather than implying
  zero.

Use `views`, not `people` or `reads`, unless the implemented measurement can
truthfully prove unique people or completed reading. The intended aggregate
must remain server-validated, bot-filtered, identifier-free, retention-bounded,
and free of event-level visitor records. Its implementation requires a privacy
and Blog presentation-reader decision in the shared measurement spine before Blog UI
or storage changes begin.

## Ownership and boundaries

- `fireux-blogs` owns canonical BlogPost shape, storage, projection, and
  Sproochli attachment.
- The named Firestore database owns ecosystem partitioning. BlogPost stores
  source App provenance and publication state, not duplicate ecosystem or
  generic owner scope.
- The document id is reader-supplied. The authored byline snapshot is public
  article content and excludes author email.
- The source App owns the authored story and its review.
- A tenant feed may reference a canonical post by slug; it does not copy the
  title, body, translation, or media.
- Durable Blog media uses HTTPS Storage URLs. Artwork may establish a visual
  family, but it must not introduce factual claims absent from the article.
- Temporary research, event notes, drafts, and one-off style decisions do not
  belong in this map.

## Current sources and exemplars

- `packages/extensions/fireux-blogs/src/runtime/blog/models/blogPost.model.ts`
- `packages/extensions/fireux-blogs/src/runtime/blog/server/read.ts`
- `packages/extensions/fireux-blogs/src/runtime/blog/server/authoring.ts`
- `packages/extensions/fireux-blogs/src/runtime/blog/composables/authoring/useBlogCommand.ts`
- `packages/extensions/fireux-blogs/tests/blog-authoring.test.mjs`
- `projects/misebox/interlaken-essen/app/content/futter.ts`
- `packages/extensions/fireux-blogs/src/runtime/blog/utils/editorial-review.ts`
- `packages/extensions/fireux-blogs/src/runtime/blog/components/Edit/Index.vue`
- `packages/extensions/fireux-blogs/src/runtime/blog/utils/blog-editor.ts`
- `packages/extensions/fireux-blogs/tests/blog-editor.test.mjs`
- `docs/concepts/product-language.md`
- `docs/concepts/translation.md`
- Published Interlaken Essen posts under `/blog`

## Refresh and verification

Review this map when Blog ownership, translation review, feed composition, or
the recurring editorial method changes. Do not update it for a single event.
Before publishing, verify source facts, validate the canonical model fields,
run available source-owned checks for the affected contract, and inspect every approved
language through the Blog presentation reader.
