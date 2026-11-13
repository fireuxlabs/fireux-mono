# Search launch

The preview is deliberately unindexed. Passing technical checks does not establish
indexation, rankings, traffic, rich-result eligibility or commercial outcomes.

## Current page ownership

`app/content/activities.json` owns the complete sourced activity catalogue;
`site-information.ts` owns rentals, vouchers and supporting information. The
landing preserves the mountain animation and links into summer, winter, courses
and all activity pages. Existing heli detail pages remain available. The App
owns these facts and routes; Core owns canonical/social metadata, robots and
sitemap transport. `app/utils/site-seo.ts` adds visible, sourced facts to Core’s
graph. Legacy activities do not claim a current Service. `test:seo` and
`test:site` check rendered responses and content coverage.

## Before production indexing

- Confirm the production hostname and approve the full-site replacement scope.
  Reconcile every original English and German URL against
  `original-source-inventory.json`, including archived and broken destinations.
- Inventory existing English and German URLs and Search Console performance.
  Agree individual permanent redirects for changed pages. Do not redirect the
  whole existing website to the homepage.
- Obtain operator approval for current prices, season/departure arrangements,
  group requirements, contact details, photographs and guide credentials.
- Add complete reviewed language pages before advertising language alternates.
  English-only pages do not emit German hreflang or claim translated content.
- Update the reviewed `seo.siteUrl`, release build origin and App domain binding
  together. Remove preview-wide indexing blocks in App configuration and Hosting
  only for that approved launch. Preserve `/operator` and Core’s private routes
  as noindex and outside sitemap discovery.
- Rebuild and verify rendered canonical URLs, HTTP/meta robots, actual redirects,
  Core’s generated robots.txt and XML sitemaps on the production hostname.
  Set `ALPINE_TEST_ORIGIN` and `ALPINE_CANONICAL_ORIGIN` explicitly for rendered
  checks; preview-specific exclusion assertions must be updated for the approved
  production policy rather than treated as public-launch checks.
- Validate the public graph with the relevant search-engine tools. The Service
  graph is descriptive; no particular rich result is promised.
- Verify ownership in Search Console and submit the production sitemap. Record
  the existing baseline before launch; no access or measurement is claimed here.

## Evidence for the client

Use aggregate Search Console impressions, clicks, queries and landing-page
results. Separate branded and non-branded searches and account for winter
seasonality. The operator confirms actual enquiries received; preparing an email
draft is not evidence that one arrived. No behavioral tracking, customer database
or invented analytics is introduced by this SEO change.

Reviewed source: Google’s [helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content),
[migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes),
and [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
