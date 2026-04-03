import type { Theme } from 'vitepress'
import { h } from 'vue'
import SugarTheme from '@sugarat/theme'
import './custom.css'

import ArchivePage from './components/ArchivePage.vue'
import PostMeta from './components/PostMeta.vue'
import ValineComments from './components/ValineComments.vue'

const theme: Theme = {
  ...SugarTheme,
  Layout() {
    return h(SugarTheme.Layout, null, {
      'doc-before': () => h(PostMeta),
      'doc-after': () => h(ValineComments)
    })
  },
  enhanceApp({ app, ...rest }) {
    SugarTheme.enhanceApp?.({ app, ...rest })
    app.component('ArchivePage', ArchivePage)
  }
}

export default theme
