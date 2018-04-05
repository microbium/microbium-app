import Vue from 'vue'
import MicrobiumEmbed from './MicrobiumEmbed'

Vue.config.productionTip = false

// OPTIM: Would be nice to not depend on Vue for embed
// It's not really needed and is ~20% of bundle size
// Might not be worth redesigning the component structure though ...
let viewer = null
export function mountViewer (rawSceneData, el_) {
  if (viewer) {
    viewer.updateSceneData(rawSceneData)
    return
  }

  let el = el_
  if (!el) {
    el = document.createElement('div')
    document.body.appendChild(el)
  }

  viewer = new Vue({
    el,
    components: { MicrobiumEmbed },
    template: '<microbium-embed :rawSceneData="rawSceneData" />',

    data () {
      return {
        rawSceneData
      }
    },

    methods: {
      updateSceneData (rawSceneData) {
        this.rawSceneData = rawSceneData
      }
    }
  })

  return {
    updateSceneData (rawSceneData) {
      viewer.updateSceneData(rawSceneData)
    }
  }
}

;(function init () {
  if (window.microbiumAsyncInit) {
    setTimeout(window.microbiumAsyncInit, 1)
  }
})()
