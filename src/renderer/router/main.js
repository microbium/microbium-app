import Vue from 'vue'
import Router from 'vue-router'

import Editor from '@renderer/components/Editor'
import Palette from '@renderer/components/Palette'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'editor',
      component: Editor,
      meta: {
        title: 'Editor'
      }
    },
    {
      path: '/palette',
      name: 'palette',
      component: Palette,
      meta: {
        title: 'Palette'
      }
    }
  ]
})
router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  next()
})

export default router
