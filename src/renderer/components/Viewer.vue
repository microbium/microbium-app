<template>
  <div class="viewer">
    <div class="viewer__scene">
      <editor-compositor
        :observeMessage="observeMessage"
        :sendMessage="sendMessage"
        :updateCursor="updateCursor" />
    </div>
  </div>
</template>

<style lang="scss">
.viewer {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #666;
  color: #444;
  animation: fadein 300ms;

  &__scene {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>

<script>
import EventEmitter from 'events'
import EditorCompositor from './editor/Compositor'

export default {
  name: 'viewer',

  components: {
    EditorCompositor
  },

  props: {
    rawSceneData: String
  },

  created () {
    this.messenger = new EventEmitter()
    this.initializeScene(this.rawSceneData)
  },

  methods: {
    initializeScene (sceneData) {
      const { messenger } = this
      if (!sceneData) return

      messenger.once('main-started', () => {
        messenger.emit('deserialize-scene', null, sceneData)
        messenger.emit('command', null, {action: 'SIMULATION_TOGGLE'})
      })
    },

    updateCursor () {
    }
  },

  computed: {
    observeMessage () {
      const { messenger } = this
      return messenger.addListener.bind(messenger)
    },

    sendMessage () {
      const { messenger } = this
      return messenger.emit.bind(messenger)
    }
  }

  // TODO: Enable observing upstream data changes
  // watch: {
  //   rawSceneData (value) {
  //     this.initializeScene(value)
  //   }
  // }
}
</script>
