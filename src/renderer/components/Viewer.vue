<template>
  <div class="viewer">
    <div class="viewer__scene">
      <editor-compositor
        :observeMessage="observeMessage"
        :sendMessage="sendMessage"
        :updateCursor="updateCursor" />
    </div>
    <div class="viewer__info">
      <a class="viewer__app-icon" href="https://MicrobiumApp.com" target="_blank">
        <span class="visuallyhidden">Microbium App</span>
      </a>
    </div>
  </div>
</template>

<style lang="scss">
.viewer {
  position: absolute;
  top: 0;
  left: 0;

  background-color: #222;
  width: 100%;
  height: 100%;
  color: #fff;

  &__scene {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__info {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 8px 14px;
  }

  &__app-icon {
    position: relative;
    display: block;
    width: 40px;
    height: 40px;

    background: url(../assets/icons/app-mono.png);
    background-size: contain;
    background-position: center;
    opacity: 0.6;

    cursor: pointer;
    text-decoration: none;
    transition: opacity 200ms;

    &:hover {
      opacity: 1;
    }
  }
}
</style>

<script>
import EventEmitter from 'events'
import EditorCompositor from './editor/Compositor'

const DEBUG_INIT_PAUSE = false

export default {
  name: 'viewer',

  components: {
    EditorCompositor
  },

  props: {
    rawSceneData: String
  },

  data () {
    return {
      isPaused: false
    }
  },

  created () {
    this.messenger = new EventEmitter()
    this.initializeScene(this.rawSceneData)
    this.bindEvents()
  },

  methods: {
    initializeScene (sceneData) {
      const { messenger } = this
      if (!sceneData) return

      messenger.once('main-will-start', () => {
        messenger.emit('deserialize-scene', null, sceneData)
        messenger.emit('command', null, {action: 'SIMULATION_TOGGLE'})
        if (DEBUG_INIT_PAUSE) this.togglePause()
      })
    },

    bindEvents () {
      document.addEventListener('keyup', this.keyUp, false)
    },

    keyUp (event) {
      switch (event.code) {
        case 'Space':
          this.togglePause()
          break
      }
    },

    togglePause () {
      this.isPaused = !this.isPaused
      this.messenger.emit('command', null, {action: 'SIMULATION_TOGGLE_PAUSE'})
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
