# Misebox TODO

## Sitemap and public-route cleanup

- Remove or replace the stale static paths `/programme`, `/luna-piccante`, and `/luna-piccante/menu`; all currently return 404 while appearing in the generated sitemap.
- Audit the complete generated static sitemap against the production host and remove routes that are internal, experimental, duplicated, or not publicly useful.
- Decide whether developer and paused test surfaces such as `/learn-more/dev` and `/solutions/text` should be removed, access-controlled, or marked `noindex`.
- Verify canonical production origins in `robots.txt`, the sitemap index, and every child sitemap after deployment.
- Add an automated sitemap check that fails when a listed URL returns a non-success response.

