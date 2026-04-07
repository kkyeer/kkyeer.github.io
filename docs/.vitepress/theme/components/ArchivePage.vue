<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { inBrowser, useData, useRoute, withBase } from 'vitepress'

import { categoryTree, getCategoryColorToken } from '../lib/category-tree.mjs'
import { buildArchiveSectionsFromTheme, buildCategoryArchiveFromTheme } from '../lib/sugar-archive-data.mjs'

const props = defineProps<{
  type: 'categories' | 'tags' | 'timeline'
}>()

const { localeIndex, site, theme } = useData()
const route = useRoute()
const activeTag = ref('')
const pagesData = computed(() => {
  const localeKeys = Object.keys(site.value.locales || {})

  if (localeKeys.length === 0) {
    return theme.value.blog?.pagesData || []
  }

  return theme.value.blog?.locales?.[localeIndex.value]?.pagesData || []
})

function syncActiveTag() {
  if (!inBrowser || props.type !== 'tags') {
    activeTag.value = ''
    return
  }

  activeTag.value = new URLSearchParams(window.location.search).get('tag')?.trim() ?? ''
}

function syncTagQuery(tag: string) {
  if (!inBrowser || props.type !== 'tags') {
    return
  }

  const nextUrl = new URL(window.location.href)

  if (tag) {
    nextUrl.searchParams.set('tag', tag)
  } else {
    nextUrl.searchParams.delete('tag')
  }

  const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
  window.history.pushState({}, '', nextPath)
}

function toggleTagFilter(tag: string) {
  if (props.type !== 'tags') {
    return
  }

  const nextTag = activeTag.value === tag ? '' : tag
  activeTag.value = nextTag
  syncTagQuery(nextTag)
}

onMounted(() => {
  syncActiveTag()
  if (inBrowser) {
    window.addEventListener('popstate', syncActiveTag)
  }
})

onUnmounted(() => {
  if (inBrowser) {
    window.removeEventListener('popstate', syncActiveTag)
  }
})

watch(
  () => route.path,
  () => {
    syncActiveTag()
  }
)

const sections = computed(() => buildArchiveSectionsFromTheme(pagesData.value, props.type))
const categoryArchive = computed(() => buildCategoryArchiveFromTheme(pagesData.value, categoryTree))
const categoryLinks = computed(() =>
  categoryArchive.value.topGroups.flatMap((group) => group.children.map((item) => ({
    ...item,
    primaryName: group.primaryName
  })))
)
const visibleSections = computed(() => {
  if (props.type === 'categories') {
    return categoryArchive.value.sections
  }
  if (props.type === 'tags' && activeTag.value) {
    return sections.value.filter((section) => section.name === activeTag.value)
  }
  return sections.value
})

const summaryLabel = computed(() => {
  if (props.type === 'categories') {
    return '分类'
  }
  if (props.type === 'tags') {
    return '标签'
  }
  return '时间线'
})
const highlightSections = computed(() => {
  if (props.type === 'categories') {
    return []
  }
  return sections.value.slice(0, props.type === 'timeline' ? 10 : 24)
})
const tagHighlightSections = computed(() =>
  highlightSections.value.map((section) => ({
    ...section,
    colorToken: getCategoryColorToken(section.name)
  }))
)

function formatTaxonomy(label: string, values: string[]) {
  if (!values.length) {
    return ''
  }
  return `${label} · ${values.join(' / ')}`
}

function metaLinesFor(post: {
  categories: string[]
  tags: string[]
}) {
  const lines = []

  if (props.type !== 'categories' && post.categories.length) {
    lines.push(formatTaxonomy('分类', post.categories))
  }
  if (props.type !== 'tags' && post.tags.length) {
    lines.push(formatTaxonomy('标签', post.tags))
  }

  return lines
}

function topHrefFor(section: { name: string; slug: string }) {
  return `#${section.slug}`
}

function sectionCountLabel(section: {
  count: number
  primaryName?: string
}) {
  if (props.type === 'categories' && section.primaryName) {
    return `${section.primaryName} · ${section.count} 篇文章`
  }
  return `${section.count} 篇文章`
}
</script>

<template>
  <section class="kk-archive-page">
    <nav
      v-if="props.type === 'tags' && highlightSections.length"
      class="kk-category-groups"
      :aria-label="`${summaryLabel}快速导航`"
    >
      <div class="kk-category-grid">
        <button
          v-for="section in tagHighlightSections"
          :key="section.slug"
          class="kk-category-link kk-tag-filter"
          :class="{ 'is-active': activeTag === section.name }"
          type="button"
          :aria-pressed="props.type === 'tags' && activeTag === section.name"
          @click="toggleTagFilter(section.name)"
        >
          <span>{{ section.name }}</span>
          <span class="kk-category-link__count" :style="{ backgroundColor: `var(--${section.colorToken})` }">
            {{ section.count }}
          </span>
        </button>
      </div>
    </nav>
    <nav
      v-else-if="props.type === 'timeline' && highlightSections.length"
      class="kk-archive-page__top-nav"
      :aria-label="`${summaryLabel}快速导航`"
    >
      <a
        v-for="section in highlightSections"
        :key="section.slug"
        class="kk-archive-chip"
        :href="topHrefFor(section)"
      >
        <span>{{ section.name }}</span>
        <span class="kk-archive-chip__count">{{ section.count }}</span>
      </a>
    </nav>
    <nav v-else-if="props.type === 'categories'" class="kk-category-groups" aria-label="分类快速导航">
      <div class="kk-category-grid">
        <a
          v-for="item in categoryLinks"
          :key="item.slug"
          class="kk-category-link"
          :href="`#${item.slug}`"
        >
          <span>{{ item.name }}</span>
          <span class="kk-category-link__count" :style="{ backgroundColor: `var(--${item.colorToken})` }">
            {{ item.count }}
          </span>
        </a>
      </div>
    </nav>

    <p v-if="props.type === 'tags' && activeTag && !visibleSections.length" class="kk-archive-page__empty">
      未找到标签 “{{ activeTag }}” 对应的文章。
    </p>

    <section
      v-for="section in visibleSections"
      :key="section.slug"
      class="kk-archive-section"
    >
      <header class="kk-archive-section__header">
        <div>
          <h2 :id="section.slug">{{ section.name }}</h2>
          <p>{{ sectionCountLabel(section) }}</p>
        </div>
        <a v-if="props.type !== 'tags'" class="kk-archive-section__anchor" :href="`#${section.slug}`">#</a>
      </header>

      <ul class="kk-archive-posts">
        <li v-for="post in section.posts" :key="post.url" class="kk-archive-post">
          <a class="kk-archive-post__title" :href="withBase(post.url)">{{ post.title }}</a>
          <p class="kk-archive-post__meta">{{ post.date }}</p>
          <p v-if="post.excerpt" class="kk-archive-post__excerpt">{{ post.excerpt }}</p>
          <ul v-if="metaLinesFor(post).length" class="kk-archive-post__taxonomy">
            <li v-for="line in metaLinesFor(post)" :key="`${post.url}-${line}`">{{ line }}</li>
          </ul>
        </li>
      </ul>
    </section>
  </section>
</template>
