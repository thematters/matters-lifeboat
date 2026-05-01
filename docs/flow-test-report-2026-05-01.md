# Matters Lifeboat Flow Test Report — @charlesmungerai — 2026-05-01

## Scope

Goal: verify that a human or agent can complete the backup, Pinata, and self-hosting paths with the fewest possible steps.

Test account: `https://matters.town/@charlesmungerai`

## Results

| Area | Result | Evidence |
| --- | --- | --- |
| Browser GraphQL proxy | Pass | `OPTIONS` from `https://lifeboat.matters.town` returns `204` with matching CORS headers. |
| Backup export with images | Pass | 7 articles, 14 images, 0 image failures, 9.47 MB ZIP. |
| Backup readability | Pass | ZIP unzips cleanly on macOS; contains `README.md`, `AGENT.md`, `MANIFEST.json`, Markdown posts, and assets. |
| Agent readability | Pass | `MANIFEST.json` is structured, `posts/*.md` use YAML frontmatter, and filenames are ASCII-only for automation. |
| Existing IPFS availability | Pass | All 7 article `dataHash` CIDs returned HTTP 200 through a public IPFS gateway during testing. |
| Pinata by-hash re-pin | Blocked by plan | JWT auth worked, but Pinata returned `PAID_FEATURE_ONLY` for all 7 `pinByHash` calls. This is not a Lifeboat code bug; the free account cannot re-pin existing CIDs by hash. |
| Pinata public file upload | Pass | Uploaded final backup ZIP and static-site ZIP to Pinata public IPFS with a generated API key. Both files returned CID and at least one public gateway returned HTTP 200. |
| Article address book | Pass | New lightweight package contains `index.html`, `address-book.json`, `address-book.csv`, `README.md`, and `AGENT.md`; 7 articles / 7 CIDs / 7.1 KB in the test run. |
| Static site package | Pass | 7 post HTML pages, 14 assets, `index.html`, `style.css`, `manifest.json`, `README.md`, `AGENT.md`; ZIP unzips cleanly. |
| Human local preview | Pass | Generated static package is plain files; no build step is required before upload. |
| Agent handoff | Pass | Static site package includes `AGENT.md` with direct-upload rules and no build step. |
| Real Cloudflare deployment | Pass | Deployed to `https://charlesmungerai-lifeboat.matters-lab.workers.dev/`; index and post page return HTTP 200. No `matters.town` domain was used for hosting. |
| Real Pinata key | Pass | Created `lifeboat-charlesmungerai-2026-05-01` in Pinata. Key remains active in the workspace and can be revoked after testing. |
| Production Lifeboat update | Pass | `https://lifeboat.matters.town/` and `/app/` now serve the simplified three-step UX from Worker version `fc3b26bd`; CORS preflight returns HTTP 204. |

## Findings

1. The production backup fetch path was showing the proxy host but not passing that endpoint into `exportUser`. Browser users would hit the official GraphQL endpoint directly and fail under CORS.
2. The original self-hosting package produced an Astro source project. That required `npm install`, `npm run build`, and Cloudflare build settings, which is too much for the target "simplest possible" flow.
3. The first backup and static-site packages used article slug filenames. macOS `unzip` could garble or reject some non-ASCII filenames, making the "download, unzip, drag" path unreliable.
4. App TypeScript checks failed because the Button component referenced `process.env.NODE_ENV` while the app tsconfig only exposes Vite client types.
5. The previous production site was still serving the older copy/bundle; it has now been replaced through the `matters-lifeboat-proxy` Worker with embedded static assets because the old Pages.dev project was not visible in the current Cloudflare account.
6. Pinata's free/current account path does not support `pinByHash`; the default UX must use public file upload of `backup.zip`, with by-hash CID re-pin kept as an advanced/paid-path option.
7. A ZIP-only Pinata upload is not useful enough for humans to share. The Pinata flow should produce a public article address page first, then upload the ZIP as the durable full backup.
8. Pinata key creation needs "beginner mode" copy: explain JWT as a temporary upload pass and give explicit UI clicks.
9. Cloudflare direct upload is easy, but the flow must explicitly say to choose Upload your static files and press Deploy after files appear.

## Changes Made

1. Flow A and the shared BackupGate now pass `getEndpoint()` into `exportUser`, so the browser uses the Cloudflare Worker proxy.
2. Flow C now generates a pure static website ZIP for Cloudflare Workers & Pages upload:
   - no GitHub required
   - no Node.js required
   - no build command required
   - publish directory is the ZIP root
3. Backup and static site post filenames are now ASCII-only: `posts/YYYY-MM-DD-shortHash.md` and `posts/YYYY-MM-DD-shortHash.html`.
4. The static site package now includes human and agent deployment instructions.
5. Added `packages/core/src/test-flow.ts` for repeatable flow testing.
6. Replaced the app-side `process.env.NODE_ENV` check with `import.meta.env.DEV`.
7. Updated landing page copy with a three-step human/agent guide and icons.
8. Updated repo and generated package instructions to remove the Astro-first self-hosting path.
9. Changed Flow B from by-hash re-pin as the default to Pinata public ZIP upload, which is the path that completed successfully on the tested account.
10. Deployed the updated landing and app bundle to `lifeboat.matters.town` through `matters-lifeboat-proxy` Worker version `fc3b26bd`.
11. Added a lightweight article address book: no image download, no full backup, just article titles, Matters links, CIDs, gateway links, JSON, CSV, and a human-readable HTML page.
12. Updated Flow B so Pinata uploads a shareable article address page plus the full backup ZIP.
13. Rewrote the landing and app copy for non-technical users: CID = article address/fingerprint, JWT = temporary pass, Cloudflare = upload folder then Deploy.

## Browser UX Notes

1. Cloudflare's old-looking Direct Upload URL redirected to the Git provider screen. The reliable path in the current dashboard is Workers & Pages -> Create application -> Upload your static files.
2. Pinata `pinByHash` returned `PAID_FEATURE_ONLY`. The simple path should say "upload backup.zip to Pinata public IPFS"; "pin every original article CID" should be labeled advanced/plan-dependent.
3. The current Pinata simple path should say "upload article address page + backup ZIP"; the address page is the shareable artifact, while ZIP is the preservation artifact.

## Recommended User Flow

1. Enter Matters username.
2. Optional first step: download article address book.
3. Download full backup ZIP.
4. Optional: upload article address page and `backup.zip` to Pinata public IPFS with the user's own JWT.
5. Optional: generate static site ZIP.
6. Unzip static site ZIP, drag the folder into Cloudflare Workers & Pages -> Upload your static files, then press Deploy.

The self-hosting path should no longer mention Astro unless the user explicitly wants a developer-editable source project.

## Live Test Outputs

- Cloudflare static site: `https://charlesmungerai-lifeboat.matters-lab.workers.dev/`
- Production Lifeboat: `https://lifeboat.matters.town/`
- Pinata backup ZIP CID: `bafybeiavw6ennv27mry7wcns2hexxs3xsganietyqv2soob7bknb3nc6de`
- Pinata backup ZIP gateway: `https://bafybeiavw6ennv27mry7wcns2hexxs3xsganietyqv2soob7bknb3nc6de.ipfs.dweb.link/`
- Pinata static-site ZIP CID: `bafybeiaj6uyvrx24cr3kqothiciqwokecxurek6bzks2hjs2ipwlvdvxxy`
- Pinata static-site ZIP gateway: `https://red-added-panda-34.mypinata.cloud/ipfs/bafybeiaj6uyvrx24cr3kqothiciqwokecxurek6bzks2hjs2ipwlvdvxxy`

## Test Artifacts

- Backup ZIP: `/Users/mashbean/Documents/AI-Agent/matters-lifeboat/tmp/flow-test/charlesmungerai-backup.zip`
- Article address book ZIP: `/Users/mashbean/Documents/AI-Agent/matters-lifeboat/tmp/flow-test/charlesmungerai-article-address-book.zip`
- Static site ZIP: `/Users/mashbean/Documents/AI-Agent/matters-lifeboat/tmp/flow-test/charlesmungerai-static-site.zip`
- Machine report: `/Users/mashbean/Documents/AI-Agent/matters-lifeboat/tmp/flow-test/charlesmungerai-report.json`
- Pinata by-hash result: `/Users/mashbean/Documents/AI-Agent/matters-lifeboat/tmp/flow-test/charlesmungerai-pinata-result.json`
- Pinata upload result: `/Users/mashbean/Documents/AI-Agent/matters-lifeboat/tmp/flow-test/charlesmungerai-pinata-upload-result.json`

## Verification Commands

```bash
node_modules/.bin/tsx packages/core/src/test-flow.ts charlesmungerai --images
node_modules/.bin/tsc -p packages/core/tsconfig.json
node_modules/.bin/tsc -p packages/app/tsconfig.json --noEmit
cd packages/app && node ../../node_modules/vite/bin/vite.js build
```

Note: in this Codex desktop environment, the working Node binary for Vite was the bundled runtime at `/Users/mashbean/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.
