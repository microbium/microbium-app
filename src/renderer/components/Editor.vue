<template>
  <div class="editor">
    <div class="editor-toolbar">
      <div class="editor-toolbar__draggable"></div>
      <div class="editor-toolbar__title" v-if="fileName && !isFullscreen">
        <span @click.meta="openFileLocation">
          {{ fileName }}
        </span>
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
    <editor-compositor
      :updateCursor="updateCursor" />
    <editor-cursor v-if="cursor.shouldShow"
      :position="cursor.position" />
  </div>
</template>

<style lang="scss">
.editor {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #53B5C9;
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

    color: rgba(49,64,68,0.95);
    font-size: 14px;
    text-align: center;
    cursor: default;
  }

  .input-select > select {
    font-size: 14px;
  }
}
</style>

<script>
import { debounce } from '@/utils/function'
import { isFullscreen } from '@/utils/screen'

import InputSelect from './input/Select'
import EditorCompositor from './editor/Compositor'
import EditorCursor from './editor/Cursor'

export default {
  name: 'editor',

  components: {
    InputSelect,
    EditorCompositor,
    EditorCursor
  },

  data () {
    return {
      fileName: null,
      fileFullPath: null,
      isFullscreen: false,
      cursor: {
        shouldShow: true,
        position: {x: 0, y: 0}
      }
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

    openFileLocation () {
      this.$electron.shell.showItemInFolder(this.fileFullPath)
    },

    resize (event) {
      this.isFullscreen = isFullscreen()
    },

    // TODO: Hide cursor on mouseleave
    updateCursor (shouldShow, position, type) {
      const { cursor } = this

      cursor.shouldShow = shouldShow
      if (!shouldShow) return

      cursor.position.x = position[0]
      cursor.position.y = position[1]
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
