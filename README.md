# SKY website

Public source for the SKY website baseline version 211.

- `public/`: website pages, styles, browser tools and vendor scripts.
- `src/worker.js`: Cloudflare Worker backend.
- `wrangler.toml`: deployment configuration template with a placeholder KV namespace ID.
- `deployment-manifest.json`: baseline provenance and original source checksums.
- `published-checksums.json`: checksums of the published source files.

## Source status

This is a reconstructed production baseline, not the original deployment archive. The Worker source matches the accepted version 211 backup. Unfinished preview changes are not included.

Image generation is not verified fixed. Daily limits use non-atomic KV counters, so this baseline does not provide strict concurrent-request limits.

The GitHub editor added one final newline to `public/star-dust.svg` and `public/vendor/JsBarcode.all.min.js`. Their published checksums therefore differ from the original checksums in the deployment manifest. The manifest itself also gained a final newline. No other source bytes differ from the supplied baseline.

## Configuration

Secret values, account IDs and the production KV namespace ID are not included. A separate Cloudflare setup with the required AI, asset and KV bindings and a `RATE_HMAC_KEY` secret is needed to run the backend. The code also supports an optional `GROQ_API_KEY` secret. Do not commit secrets or local environment files.

This repository does not set up GitHub Pages, automated deployment or changes to the live website. It is not a claim that every feature works or a ready-to-deploy release.

Existing third-party copyright and license notices are preserved in the vendor files. No new license for the SKY code is selected here.
