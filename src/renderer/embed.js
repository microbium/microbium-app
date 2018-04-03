import Vue from 'vue'
import MicrobiumEmbed from './MicrobiumEmbed'

Vue.config.productionTip = false

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
