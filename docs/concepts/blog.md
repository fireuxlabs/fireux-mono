# Blog literature

Updated: 2026-08-01
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
