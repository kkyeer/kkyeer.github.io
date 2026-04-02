# VuePress to VitePress Migration Implementation Plan

> Status 2026-04-02: This initial migration plan is kept as background material. The content-audit and deploy ideas remain useful, but the theme-layer and archive execution baseline has been superseded by [2026-04-02-sugar-blog-theme-migration-implementation.md](./2026-04-02-sugar-blog-theme-migration-implementation.md).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate this blog from `vuepress@1.9.9 + vuepress-theme-reco@1.6.17` to VitePress while preserving existing content, comments, analytics, category/tag/timeline aggregation, deployment, and custom styling.

**Architecture:** Keep the existing Markdown content under `docs/` as the source of truth. Introduce a new VitePress app under `docs/.vitepress/`, rebuild reco-specific blog features using VitePress theme extension plus a generated content index, and switch deployment only after the new site reaches feature parity.

**Tech Stack:** VitePress, Vue 3, Vite, VitePress theme extension, Markdown frontmatter parsing, optional VitePress plugins/theme hooks, GitHub Actions.

---

## Current Project Facts

- Current framework: `vuepress@1.9.9`
- Current theme: `vuepress-theme-reco@1.6.17`
- Current content root: `docs/`
- Current build output: `public`
- Current deployment targets:
  - GitHub Pages via `.github/workflows/blog.yml`
  - Remote server via `upload.js`
- Current custom/runtime features discovered in repo:
  - Valine comments via `docs/.vuepress/config.js`
  - Feed and sitemap config via reco theme
  - Category and tag aggregation via reco theme blog mode
  - Timeline page via reco theme blog mode
  - Friend links via reco theme
  - Custom head tags and external font CSS
  - Flowchart plugin via `vuepress-plugin-flowchart`
  - Production CDN asset path override via `configureWebpack.output.publicPath`
- Content inventory discovered in repo:
  - Markdown posts under `docs/views`: 137
  - Posts with `publish: false`: 26
  - Posts with `categories:`: 132
  - Posts with `tags:`: 123

## Migration Strategy

Use a two-track migration, not an in-place rewrite:

1. Keep existing VuePress site runnable during migration.
2. Build a parallel VitePress site in the same repo.
3. Recreate blog features in this order:
   - content rendering parity
   - theme/layout parity
   - comments and analytics
   - category/tag/timeline aggregation
   - feed/sitemap/deploy parity
4. Cut over only after comparing production output and route coverage.

This is the lowest-risk path because the hard part is not Markdown rendering. The hard part is replacing reco theme behavior that currently hides a lot of blog logic.

## Proposed File Structure

**Existing files to keep as content source**
- `docs/README.md`
- `docs/views/**/*.md`
- `docs/.vuepress/public/**`
- `docs/.vuepress/styles/index.styl`
- `.github/workflows/blog.yml`
- `upload.js`

**New VitePress files to add**
- `docs/.vitepress/config.mts`
- `docs/.vitepress/theme/index.ts`
- `docs/.vitepress/theme/custom.css`
- `docs/.vitepress/theme/components/BlogHome.vue`
- `docs/.vitepress/theme/components/PostList.vue`
- `docs/.vitepress/theme/components/PostMeta.vue`
- `docs/.vitepress/theme/components/CategoryList.vue`
- `docs/.vitepress/theme/components/TagList.vue`
- `docs/.vitepress/theme/components/TimelineList.vue`
- `docs/.vitepress/theme/components/FriendLinks.vue`
- `docs/.vitepress/theme/components/Comments.vue`
- `docs/.vitepress/theme/components/AnalyticsProvider.vue`
- `docs/.vitepress/theme/lib/content.ts`
- `docs/.vitepress/theme/lib/routes.ts`
- `docs/.vitepress/theme/lib/frontmatter.ts`
- `docs/index.md`
- `docs/categories/index.md`
- `docs/tags/index.md`
- `docs/timeline/index.md`
- `docs/friends/index.md`
- `scripts/vitepress/generate-blog-index.mjs`
- `scripts/vitepress/validate-frontmatter.mjs`

**Likely files to modify**
- `package.json`
- `README.md`
- `.github/workflows/blog.yml`
- `upload.js`

## Feature Mapping

### 1. Content Rendering

**VuePress source**
- `docs/views/**/*.md`
- `docs/README.md`

**VitePress target**
- Reuse Markdown files as-is where possible.
- Preserve frontmatter fields: `date`, `categories`, `tags`, `publish`.

**Expected changes**
- `home: true`, `features`, `bgImageStyle`, `isShowTitleInHome` in `docs/README.md` are reco-specific.
- VitePress homepage should become explicit page content plus a custom home component.

### 2. Theme / Layout

**VuePress source**
- `docs/.vuepress/config.js`
- `docs/.vuepress/styles/index.styl`

**VitePress target**
- Translate global config to `docs/.vitepress/config.mts`
- Convert Stylus overrides into CSS variables and scoped theme CSS in `docs/.vitepress/theme/custom.css`
- Use `extends: DefaultTheme` style theme extension for post pages and landing page

**Expected changes**
- Reco icon classes like `reco-home`, `reco-category`, `reco-message` do not carry over.
- Navigation must be rewritten with VitePress nav/sidebar schema.
- `sidebar: auto` behavior becomes VitePress outline/sidebar config and page-level control.

### 3. Category / Tag / Timeline Aggregation

**VuePress source**
- `themeConfig.blogConfig.category`
- `themeConfig.blogConfig.tag`
- article frontmatter under `docs/views/**/*.md`

**VitePress target**
- Generate a normalized post index from all Markdown frontmatter.
- Build custom archive pages and detail routes:
  - `/categories/`
  - `/tags/`
  - `/timeline/`
- Option A: static generated pages from a script
- Option B: runtime archive pages using `import.meta.glob`

**Recommendation**
- Use a generated index plus runtime rendering.
- Keep routes simple:
  - `/categories/index.md`
  - `/tags/index.md`
  - `/timeline/index.md`
- Filter out `publish: false`.

**Reason**
- This most closely matches reco’s “automatic aggregation” without hand-maintaining archive pages.
- It avoids hard-coding every category/tag page.

### 4. Comments

**VuePress source**
- `themeConfig.valineConfig`

**VitePress target**
- Wrap Valine in a Vue component mounted only on article pages.

**Recommendation**
- Short-term: keep Valine to preserve behavior.
- Mid-term: prepare optional migration to Waline or Giscus.

**Reason**
- Valine can be ported with the least content impact.
- Waline/Giscus may be preferable later, but that is a product decision, not a migration blocker.

### 5. Analytics

**VuePress source**
- No explicit analytics plugin found in repo config, but the user states custom stats/tracking were added.

**VitePress target**
- Move tracking code to:
  - `head` tags in `config.mts`, or
  - a client-side analytics component in theme layout

**Action required**
- Confirm whether stats are currently injected outside this repo:
  - reverse proxy/Nginx
  - external script manager
  - CDN snippet

**Migration design**
- If analytics is a simple script snippet, move it into `head`.
- If analytics requires route change hooks for SPA navigation, use router lifecycle in theme.

### 6. Flowchart Support

**VuePress source**
- `plugins: ['flowchart']`

**VitePress target**
- Replace with one of:
  - Markdown-it plugin for flowchart syntax
  - Mermaid if acceptable to convert syntax
  - custom client component for flowchart.js rendering

**Recommendation**
- Audit real usage first.
- If only a small subset of posts uses flowchart syntax, prefer a targeted renderer or manual conversion.
- If many pages rely on it, install a Vite/VitePress-compatible markdown-it flowchart solution.

### 7. Feed / Sitemap

**VuePress source**
- `themeConfig.sitemap`
- `themeConfig.feed`

**VitePress target**
- Generate feed and sitemap during build from the same normalized post index.

**Recommendation**
- Do not depend on theme magic.
- Add explicit build script to generate:
  - `docs/public/feed.xml` or VitePress output equivalent
  - sitemap based on canonical hostname `https://www.tpfuture.top/`

### 8. Deployment / CDN

**VuePress source**
- build output `public`
- GitHub Pages publishes `./public`
- remote server extracts `/tmp/public/` to `/home/ngmng/data/dist/`
- webpack `publicPath` points to `https://cdn.jsdmirror.com/gh/kkyeer/kkyeer.github.io@gh-pages/`

**VitePress target**
- default output is usually `.vitepress/dist`

**Recommendation**
- Keep deployment contract stable by copying or renaming VitePress output to `public`, or update all deployment steps together.

**Preferred approach**
- Update workflow and upload pipeline to use `.vitepress/dist` directly.
- Only preserve `public` if you want a zero-change downstream deploy contract.

## Gaps and Risks

### High Risk

- Reco theme currently provides blog/archive behavior implicitly. VitePress does not. This must be rebuilt intentionally.
- `docs/README.md` frontmatter is reco-home specific and will not render equivalently in VitePress.
- CDN `publicPath` behavior in VuePress webpack is not a drop-in match for VitePress. Asset URLs must be tested in both GitHub Pages and your remote host.
- Flowchart plugin compatibility is uncertain until actual syntax usage is audited.

### Medium Risk

- Some articles do not have standardized frontmatter. Missing `categories` or `tags` will affect aggregation consistency.
- `publish: false` handling must be implemented manually, otherwise drafts may leak.
- Custom CSS was written for reco DOM structure. Some selectors will become dead or wrong in VitePress.

### Low Risk

- Markdown content itself should migrate with minimal edits.
- External images and static assets appear mostly independent from VuePress internals.

## Recommended Migration Phases

### Phase 1: Build VitePress skeleton

**Files**
- Create: `docs/.vitepress/config.mts`
- Create: `docs/.vitepress/theme/index.ts`
- Create: `docs/.vitepress/theme/custom.css`
- Modify: `package.json`

- [ ] Install VitePress and add parallel scripts.
- [ ] Keep existing VuePress scripts during migration.
- [ ] Configure `srcDir`, `title`, `description`, `head`, nav, outline, and clean default theme extension.
- [ ] Make `yarn vitepress:dev` and `yarn vitepress:build` work without touching production deploy yet.

**Acceptance**
- VitePress dev server starts.
- Homepage and at least one article page render.

### Phase 2: Port base content and homepage

**Files**
- Modify: `docs/README.md`
- Create: `docs/index.md`
- Create: `docs/.vitepress/theme/components/BlogHome.vue`

- [ ] Replace reco-specific home frontmatter with a VitePress-compatible homepage.
- [ ] Preserve your brand text, hero area, and main entry links.
- [ ] Confirm images/fonts still load correctly.

**Acceptance**
- Homepage is visually usable on desktop and mobile.
- Existing content routes remain readable.

### Phase 3: Rebuild metadata index

**Files**
- Create: `scripts/vitepress/generate-blog-index.mjs`
- Create: `scripts/vitepress/validate-frontmatter.mjs`
- Create: `docs/.vitepress/theme/lib/frontmatter.ts`
- Create: `docs/.vitepress/theme/lib/content.ts`

- [ ] Scan `docs/views/**/*.md`.
- [ ] Normalize `date`, `categories`, `tags`, `publish`, `title`, `url`.
- [ ] Exclude drafts with `publish: false`.
- [ ] Emit a reusable JSON or TS module for archive pages.
- [ ] Add validation output for malformed or missing frontmatter.

**Acceptance**
- Generated index matches expected article count.
- Category and tag counts are stable and reviewable.

### Phase 4: Rebuild category/tag/timeline pages

**Files**
- Create: `docs/categories/index.md`
- Create: `docs/tags/index.md`
- Create: `docs/timeline/index.md`
- Create: `docs/.vitepress/theme/components/PostList.vue`
- Create: `docs/.vitepress/theme/components/CategoryList.vue`
- Create: `docs/.vitepress/theme/components/TagList.vue`
- Create: `docs/.vitepress/theme/components/TimelineList.vue`

- [ ] Render category and tag archive pages from generated metadata.
- [ ] Sort timeline by descending date.
- [ ] Preserve current information architecture from nav.
- [ ] Decide whether category/tag detail pages are separate routes or interactive archive sections.

**Recommendation**
- Start with interactive archive pages first.
- Only add dedicated detail routes if SEO or external linking requires them.

**Acceptance**
- `/categories/`, `/tags/`, `/timeline/` all work.
- Counts and visible posts exclude drafts.

### Phase 5: Port comments and analytics

**Files**
- Create: `docs/.vitepress/theme/components/Comments.vue`
- Create: `docs/.vitepress/theme/components/AnalyticsProvider.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/config.mts`

- [ ] Mount comments only on post pages.
- [ ] Reuse current Valine app ID and key.
- [ ] Reintroduce analytics script or route tracking.
- [ ] Test client-side navigation for duplicate script injection.

**Acceptance**
- Comments render and submit correctly.
- Analytics fires once per page view in SPA navigation.

### Phase 6: Port friend links, feed, sitemap

**Files**
- Create: `docs/friends/index.md`
- Create: `docs/.vitepress/theme/components/FriendLinks.vue`
- Extend: `scripts/vitepress/generate-blog-index.mjs` or add feed/sitemap scripts

- [ ] Move friend links to explicit page data or theme config.
- [ ] Generate sitemap using canonical hostname.
- [ ] Generate feed from published posts only.

**Acceptance**
- `sitemap.xml` and `feed.xml` exist in build output.
- Friend links page is reachable from nav.

### Phase 7: Port deployment and cut over

**Files**
- Modify: `.github/workflows/blog.yml`
- Modify: `upload.js`
- Modify: `package.json`

- [ ] Switch CI to VitePress build command.
- [ ] Update publish directory from `./public` to VitePress output, or add a copy step.
- [ ] Update remote extraction path expectations if output directory changes.
- [ ] Verify CDN static asset references in production.
- [ ] Keep VuePress build available for one rollback cycle.

**Acceptance**
- GitHub Pages deploy succeeds.
- Remote server deploy succeeds.
- Static assets and page routes work in production.

## Concrete Replacement Decisions

### Keep

- Keep all Markdown content under `docs/views/`
- Keep existing frontmatter schema as the primary content contract
- Keep Valine initially
- Keep current hostname and deployment topology initially

### Replace

- Replace `vuepress-theme-reco` archive capabilities with explicit metadata-driven pages
- Replace reco homepage with custom VitePress homepage
- Replace webpack `publicPath` logic with Vite/VitePress asset base strategy
- Replace reco-specific friend link rendering with custom page/component

### Defer

- Defer comment-system replatforming to Waline/Giscus
- Defer full visual redesign until parity is reached
- Defer frontmatter cleanup for older posts unless validation shows blocking issues

## Minimal Viable Migration

If you want the fastest safe cutover, define “complete migration” as:

1. All published posts render in VitePress.
2. Comments work.
3. Analytics work.
4. Category/tag/timeline pages work.
5. GitHub Pages and remote deployment both work.

Do not block the migration on:

- perfect visual parity with reco
- dedicated category detail routes
- changing comment provider
- redesigning all styles

## Recommended Technical Choices

- Use VitePress theme extension, not a full custom app.
- Use generated metadata for blog aggregation, not manual page maintenance.
- Keep content paths stable to avoid broken links.
- Add frontmatter validation early, because missing metadata will become visible once theme magic is gone.
- Keep VuePress commands in `package.json` until the first VitePress production deploy is verified.

## Immediate Next Step

Start with a spike branch that adds VitePress in parallel without deleting VuePress:

```bash
yarn add -D vitepress vue
mkdir -p docs/.vitepress/theme/components docs/.vitepress/theme/lib scripts/vitepress
```

Then implement only enough config to render:

- homepage
- one post page
- one archive page prototype

This will tell you quickly whether the chosen archive architecture is correct before you spend time porting styles and deployment.
