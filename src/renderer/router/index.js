import Vue from 'vue'
import Router from 'vue-router'

import Editor from '@/components/Editor'
import Palette from '@/components/Palette'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'editor',
      component: Editor
    },
    {
      path: '/palette',
      name: 'palette',
      component: Palette
    }
  ]
})
