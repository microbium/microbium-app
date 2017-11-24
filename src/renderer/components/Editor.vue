<template>
  <div class="editor">
    <div class="editor-toolbar">
      <div class="editor-toolbar__draggable"></div>
      <div class="editor-toolbar__title" v-if="fileName && !isFullscreen">
        {{ fileName }}
        <!-- TODO: Nice to have file path dropdown like native title bar -->
        <!--
        <input-select>
          <option v-for="item in fileFullPathParts" :value="item.index">
            {{ item.name }}
          </option>
        </input-select>
        -->
      </div>
    </div>
    <editor-compositor />
    <div class="editor-background"></div>
  </div>
</template>

<style lang="scss">
.editor {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #B2C9CF;
  color: #444;
  animation: fadein 300ms;
}

.editor-toolbar {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  mix-blend-mode: overlay;

  &__draggable {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    -webkit-app-region: drag;
  }

  &__title {
    position: relative;
    margin: 0 auto;
    padding: 11px 0;
    width: 240px;

    color: rgba(#98EAFE, 0.5);
    font-size: 14px;
    text-align: center;
  }

  .input-select > select {
    font-size: 14px;
  }
}

.editor-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background-image: url(../assets/images/background.png);
  background-repeat: repeat;
  background-position: 50% 50%;
  background-size: 200px 200px;
  opacity: 0.8;

  pointer-events: none;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-image: radial-gradient(circle farthest-corner at 50% 50%,
      transparent 76%,
      rgba(#58BAA5, 0.16) 85%,
      rgba(darken(#58BAA5, 20), 0.64) 100%);
  }
}
</style>

<script>
import { debounce } from '@/utils/function'
import { isFullscreen } from '@/utils/screen'

import InputSelect from './input/Select'
import EditorCompositor from './editor/Compositor'

export default {
  name: 'editor',

  components: {
    InputSelect,
    EditorCompositor
  },

  data () {
    return {
      fileName: null,
      fileFullPath: null,
      isFullscreen: false
    }
  },

  created () {
    this.bindEvents()
    this.resize()
  },

  methods: {
    bindEvents () {
      this.message = this.message.bind(this)
      this.resize = debounce(1 / 60, this.resize.bind(this))
      window.addEventListener('resize', this.resize, false)
      this.$electron.ipcRenderer.on('message', this.message)
    },

    message (event, data) {
      switch (data.type) {
        case 'UPDATE_FILE_PATH':
          this.updateFilePath(data)
          break
      }
    },

    updateFilePath (data) {
      this.fileName = data.fileName
      this.fileFullPath = data.fullPath
    },

    resize (event) {
      this.isFullscreen = isFullscreen()
    }
  },

  computed: {
    fileFullPathParts () {
      return (this.fileFullPath || '')
        .split('/')
        .filter((v) => !!v)
        .reverse()
        .map((name, index) => {
          return {
            index,
            name
          }
        })
    }
  }
}
</script>
