# VitePress Deploy Cutover Design

## Goal

Switch the production build and deployment pipeline from VuePress `public/` output to VitePress `docs/.vitepress/dist` output.

This round focuses only on build and deployment cutover:

- production build should run `yarn vitepress:build`
- GitHub Pages should publish `docs/.vitepress/dist`
- remote server deploy should extract VitePress `dist` output
- `feed.xml` and `sitemap.xml` should remain in the published output

This round does not include:

- archive page UX enhancement
- article page context navigation
- category or tag detail routes
- VitePress asset `base` or CDN strategy changes unless build verification proves they are necessary blockers

## Current State

The repository currently has two parallel site pipelines:

1. Legacy VuePress pipeline
- `yarn build` runs `vuepress build docs`
- build output is `./public`
- GitHub Pages workflow publishes `./public`
- remote deployment compresses and uploads `./public`
- remote host extracts `/tmp/public/` into `/home/ngmng/data/dist/`

2. New VitePress pipeline
- `yarn vitepress:build` runs `vitepress build docs && node scripts/vitepress/feed-sitemap.mjs`
- build output is `docs/.vitepress/dist`
- `feed.xml` and `sitemap.xml` are already generated in `docs/.vitepress/dist`
- production deployment does not yet consume this output

## Constraints

- Do not remove the VuePress scripts yet. They remain as rollback and migration safety rails.
- Do not introduce a compatibility copy from `docs/.vitepress/dist` back to `public/`.
- Keep the remote server publish target unchanged at `/home/ngmng/data/dist/`.
- Avoid mixing deploy cutover with archive UX work.
- Avoid changing CDN and asset path strategy in the same round unless verification proves a blocker.

## Decision

Adopt direct deployment from VitePress `docs/.vitepress/dist`.

We will update all deployment steps together instead of preserving the old `public/` contract.

## Why This Approach

### Option A: Keep `public/` as a compatibility layer

Approach:
- build with VitePress
- copy or rename `docs/.vitepress/dist` to `public`
- keep workflow and remote scripts mostly unchanged

Pros:
- smallest workflow diff
- lower short-term coordination cost

Cons:
- preserves a fake contract that no longer reflects the actual site generator
- adds an extra output layer to maintain and debug
- makes later cleanup harder because deployment still conceptually depends on VuePress-era structure

### Option B: Switch all deployment steps to `docs/.vitepress/dist`

Approach:
- build with `yarn vitepress:build`
- publish `./docs/.vitepress/dist` to GitHub Pages
- archive and upload `./docs/.vitepress/dist`
- extract `/tmp/dist/` to `/home/ngmng/data/dist/`

Pros:
- one source of truth for build artifacts
- deployment contract matches the actual generator
- simpler long-term maintenance
- easier to reason about generated `feed.xml` and `sitemap.xml`

Cons:
- requires coordinated workflow updates now
- if asset path assumptions are wrong, the issue becomes visible immediately

Recommended choice: Option B.

## Target Design

### Build Scripts

`package.json` will keep both generators available, but production deployment will use VitePress.

Expected script posture after this round:

- keep `dev` and `build` for VuePress temporarily
- keep `vitepress:dev`, `vitepress:build`, `vitepress:preview`
- optionally add a dedicated deploy-oriented script only if it reduces duplication cleanly

No build artifact will be copied to `public/`.

### GitHub Pages Workflow

Update `.github/workflows/blog.yml` so that:

- install step remains unchanged unless Node version or cache settings are proven incompatible
- build step uses `yarn vitepress:build`
- GitHub Pages `publish_dir` uses `./docs/.vitepress/dist`

Acceptance:
- workflow contains no GitHub Pages publish reference to `./public`
- workflow build step does not call `yarn build`

### Remote Deployment

Update the archive and extraction flow so that:

- tar source becomes `./docs/.vitepress/dist`
- uploaded archive still lands at `/tmp/blog.tar.xz`
- remote extract result becomes `/tmp/dist/`
- remote final publish directory remains `/home/ngmng/data/dist/`

The effective remote command shape becomes:

```bash
tar -xf /tmp/blog.tar.xz -C /tmp/
rm -rf /home/ngmng/data/dist/
mv /tmp/dist/ /home/ngmng/data/dist/
```

Acceptance:
- workflow no longer assumes `/tmp/public/`
- remote deployment still ends with site files under `/home/ngmng/data/dist/`

### Feed and Sitemap

No functional change is required.

The existing VitePress build already writes:

- `docs/.vitepress/dist/feed.xml`
- `docs/.vitepress/dist/sitemap.xml`

These files become deployable automatically once the deployment pipeline switches to `docs/.vitepress/dist`.

### `upload.js`

`upload.js` uploads the tarball only and does not depend on artifact directory names.

Decision:
- do not change behavior unless a minimal comment update is useful for maintainability

## Validation Plan

Validation is split into local verification and deployment-chain verification.

### Local Verification

Run:

```bash
yarn vitepress:build
```

Confirm:
- `docs/.vitepress/dist/` exists
- `docs/.vitepress/dist/feed.xml` exists
- `docs/.vitepress/dist/sitemap.xml` exists

### Static Config Verification

Review changed files and confirm:
- `.github/workflows/blog.yml` uses `yarn vitepress:build`
- `.github/workflows/blog.yml` publishes `./docs/.vitepress/dist`
- tar command archives `./docs/.vitepress/dist`
- remote extraction command moves `/tmp/dist/`

### Deployment Verification

After CI runs on the real branch:
- GitHub Pages deploy succeeds
- remote server deploy succeeds
- homepage loads from the remote host
- at least one article page loads
- `feed.xml` is reachable
- `sitemap.xml` is reachable

## Risks

### Asset Path Risk

VitePress asset URLs may not exactly match the old VuePress `publicPath` behavior.

Mitigation:
- do not preemptively change `base` or CDN strategy in this round
- verify built pages after cutover
- if asset URLs break, treat that as the next focused fix

### Environment Risk

The project currently depends on local file dependency `@theojs/lumen: file:../../open_source/lumen/src`.

Impact:
- CI or other machines may fail to install if that path is absent

Mitigation:
- this risk is already known and independent from deploy directory cutover
- if CI install fails during deploy switch, handle dependency sourcing separately as the next blocker

### Rollback Risk

Switching workflow deployment to VitePress means production cutover happens immediately once merged.

Mitigation:
- keep VuePress scripts in `package.json`
- keep the workflow diff narrow and auditable
- revert workflow and script changes if deployment verification fails

## Implementation Scope

Files expected to change:

- `package.json`
- `.github/workflows/blog.yml`
- optionally `upload.js`
- optionally migration status docs if we record the cutover state after verification

Files explicitly out of scope:

- `docs/.vitepress/theme/**`
- archive page components
- article navigation components
- content audit rules

## Success Criteria

This round is complete when all of the following are true:

1. `yarn vitepress:build` is the production build command used by CI.
2. GitHub Pages publishes `docs/.vitepress/dist`.
3. Remote server deployment extracts VitePress `dist` output into `/home/ngmng/data/dist/`.
4. `feed.xml` and `sitemap.xml` are included in the published output.
5. VuePress scripts remain available only as temporary fallback, not as the active deployment path.
