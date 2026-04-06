export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
}

export const categoryTree = [
  {
    name: '服务端',
    slug: 'server',
    children: ['JDK源码', 'JVM', 'Java进阶', '设计模式']
  },
  {
    name: '中间件',
    slug: 'middleware',
    children: ['Spring', 'Dubbo', 'Redis']
  },
  {
    name: '前端',
    slug: 'frontend',
    children: ['JS', '前端DevOps']
  },
  {
    name: '问题解决',
    slug: 'troubleshooting',
    children: ['线上问题', '开发问题']
  },
  {
    name: '其他',
    slug: 'others',
    children: ['懂', 'Linux']
  }
]

const tintTokens = [
  'kk-category-tint-1',
  'kk-category-tint-2',
  'kk-category-tint-3',
  'kk-category-tint-4',
  'kk-category-tint-5',
  'kk-category-tint-6'
]

export function getCategoryAnchor(name) {
  return slugify(name)
}

export function findPrimaryCategoryBySecondary(name, tree = categoryTree) {
  return tree.find((group) => group.children.includes(name)) || null
}

export function getCategoryNavItems() {
  return categoryTree.map((group) => ({
    text: group.name,
    items: group.children.map((name) => ({
      text: name,
      link: `/categories/#${getCategoryAnchor(name)}`
    }))
  }))
}

export function getCategoryColorToken(name) {
  const value = String(name ?? '')
  let hash = 0
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return tintTokens[hash % tintTokens.length]
}
