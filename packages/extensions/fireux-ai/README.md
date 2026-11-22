# fireux-ai

Image, text, and document processing for FireUX domain capabilities. The
package owns provider transport, execution modes, and shared presentation.
See the [research context](docs/ai/research-context.md) for industry research.

## Document processing

[`runFireuxAiDocumentExtraction`](src/runtime/server/utils/document-ai.server.ts)
processes supplied document sources and returns complete, empty, or failed
evidence for each. The domain supplies the request, result reader, merge
policy, and schema. The provider receives only bounded task input. The domain
retains source access, review, and authorized writes.

The provider-backed mode handles billable execution. The simulator is for
development. The local Codex transport is limited to the serialized task
input and an isolated development session. Keep credentials out of browser
payloads, bound file and provider work, and preserve explicit processing and
usage approval. [Kitchen Menu preparation](../fireux-kitchens/README.md#menu-document-review)
is the reference consumer. A business inbox remains a product proposal.
