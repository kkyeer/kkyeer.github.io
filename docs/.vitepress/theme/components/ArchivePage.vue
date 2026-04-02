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

const pageTitle = computed(() => {
  if (props.type === 'categories') {
    return '按分类整理主题脉络'
  }
  if (props.type === 'tags') {
    return '按标签回看知识节点'
  }
  return '按年份回看更新轨迹'
})

const pageDescription = computed(() => {
  if (props.type === 'categories') {
    return '保留独立分类页，直接查看每个主题下的文章集合。'
  }
  if (props.type === 'tags') {
    return '标签页基于 sugar 文章元数据生成，并支持通过 URL 参数直接筛选单个标签。'
  }
  return '时间线页保留独立入口，按年份倒序组织所有公开文章。'
})

const totalPosts = computed(() => {
  const urls = new Set(visibleSections.value.flatMap((section) => section.posts.map((post) => post.url)))
  return urls.size
})

const totalTerms = computed(() => visibleSections.value.length)
const latestPostDate = computed(() => visibleSections.value[0]?.posts[0]?.date || '未知')
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
  if (props.type === 'tags') {
    return withBase(`/tags/?tag=${encodeURIComponent(section.name)}`)
  }
  return `#${section.slug}`
}
</script>

<template>
  <section class="kk-archive-page">
    <header class="kk-archive-page__hero">
      <div class="kk-archive-page__intro">
        <p class="kk-archive-page__eyebrow">{{ summaryLabel }}归档</p>
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageDescription }}</p>
      </div>
      <div class="kk-archive-page__stats">
        <article class="kk-archive-metric">
          <span>文章</span>
          <strong>{{ totalPosts }}</strong>
        </article>
        <article class="kk-archive-metric">
          <span>{{ summaryLabel }}</span>
          <strong>{{ totalTerms }}</strong>
        </article>
        <article class="kk-archive-metric">
          <span>最近更新</span>
          <strong>{{ latestPostDate }}</strong>
        </article>
      </div>
    </header>

    <div v-if="props.type === 'tags' && activeTag" class="kk-archive-page__filter">
      <span>当前标签：{{ activeTag }}</span>
      <a :href="withBase('/tags/')">查看全部</a>
    </div>

    <nav v-if="highlightSections.length" class="kk-archive-page__top-nav" :aria-label="`${summaryLabel}快速导航`">
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
