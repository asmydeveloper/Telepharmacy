# Codebase Memory MCP

Installed 7 November 2026 for the canonical Git checkout `/Users/surakiti-asia/Telepharmacy`.

- Version: 0.12.1, native macOS arm64 release, installer SHA-256 verification passed.
- Binary: `/Users/surakiti-asia/.local/bin/codebase-memory-mcp`.
- Codex MCP name: `codebase-memory`, local stdio, enabled in the user's Codex configuration. Restart the Codex session to load the new tools.
- Local project index: `Telepharmacy`, full mode, including `public/runtime/customer.js` and documentation. Build outputs, dependencies and Git internals are excluded. No shared graph artifact was added to the repository.
- Initial index: 6,054 nodes / 17,869 edges; no unusable files. Six CSS files have partial parsing diagnostics; use source inspection for constructs the parser cannot model. Index counts change as the code changes.
- Confirmed a search for `authRegisterOpen` returns the actual customer runtime source.

## Refresh the local index

```sh
/Users/surakiti-asia/.local/bin/codebase-memory-mcp cli index_repository --repo-path /Users/surakiti-asia/Telepharmacy --mode full --name Telepharmacy
```

Use graph tools for navigation and impact analysis, then inspect the actual source before editing. The graph does not replace tests, screen manifests or the application flow documents. Do not index the older Downloads copy as the canonical project. No UI daemon was started manually.

Sources: https://github.com/DeusData/codebase-memory-mcp and https://learn.chatgpt.com/docs/extend/mcp
