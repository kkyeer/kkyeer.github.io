<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { inBrowser, useData, useRoute, withBase } from 'vitepress'

import { buildArchiveSectionsFromTheme } from '../lib/sugar-archive-data.mjs'

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
const visibleSections = computed(() => {
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
const highlightSections = computed(() => sections.value.slice(0, props.type === 'timeline' ? 10 : 24))

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
</script>

<template>
  <section class="kk-archive-page">
    <div v-if="props.type === 'tags' && activeTag" class="kk-archive-page__filter">
      <span>当前标签：{{ activeTag }}</span>
      <a :href="withBase('/tags/')">查看全部</a>
    </div>

    <nav v-if="highlightSections.length" class="kk-archive-page__top-nav" :aria-label="`${summaryLabel}快速导航`">
      <button
        v-if="props.type === 'tags'"
        v-for="section in highlightSections"
        :key="section.slug"
        class="kk-archive-chip"
        :class="{ 'is-active': activeTag === section.name }"
        type="button"
        :aria-pressed="props.type === 'tags' && activeTag === section.name"
        @click="toggleTagFilter(section.name)"
      >
        <span>{{ section.name }}</span>
        <span class="kk-archive-chip__count">{{ section.count }}</span>
      </button>
      <a
        v-else
        v-for="section in highlightSections"
        :key="section.slug"
        class="kk-archive-chip"
        :href="topHrefFor(section)"
      >
        <span>{{ section.name }}</span>
        <span class="kk-archive-chip__count">{{ section.count }}</span>
      </a>
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
          <p>{{ section.count }} 篇文章</p>
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
