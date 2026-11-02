# SKY Studio - live site backup

Backup of the live SKY Studio website (late-union-112b.vikaashvarma88.workers.dev).

- `public/` - the exact static assets the site serves (37 pages + effects, fonts, icons).
- `src/public.js` - the deployed Cloudflare Worker module (static asset serving + security headers).
- `wrangler.toml` - sanitized deploy config (no account id, no secrets).
- `published-checksums.json` - sha256 of every public asset, for integrity checks.
- `deployment-manifest.json` - which live version this backup mirrors.

Secrets are never stored here. They live in Cloudflare only.
