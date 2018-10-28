<template>
  <div class="editor"
    v-on:mouseenter="mouseEnterMain">
    <div class="editor-toolbar">
      <div class="editor-toolbar__draggable"></div>
      <div class="editor-toolbar__title" v-if="fileName && !isFullscreen">
        <span @click.meta="openFileLocation">
          {{ fileName }}
        </span>
      </div>
    </div>
    <div class="editor__scene"
      v-on:mouseenter="mouseEnterScene"
      v-on:mouseleave="mouseLeaveScene">
      <editor-compositor
        :observeMessage="observeMessage"
        :sendMessage="sendMessage"
        :updateCursor="updateCursor" />
      <editor-cursor v-if="cursorIsActive"
        :visible="hasMouse"
        :model="cursorData" />
    </div>
  </div>
</template>

<style lang="scss">
.editor {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #222;
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
}
</style>

<script>
import { PNG } from 'pngjs'
import { createWriteStream } from 'fs-extra'

import { debounce } from '@renderer/utils/function'
import { isFullscreen } from '@renderer/utils/screen'
import { logger } from '@renderer/utils/logger'

import EditorCompositor from './editor/Compositor'
import EditorCursor from './editor/Cursor'

const DEBUG_DISABLE_FOCUS = true

export default {
  name: 'editor',

  components: {
    EditorCompositor,
    EditorCursor
  },

  data () {
    return {
      fileName: null,
      fileFullPath: null,
      isFullscreen: false,
      hasMouse: false,
      cursorIsActive: false,
      cursorData: null
    }
  },

  created () {
    this.bindEvents()
    this.resize()
  },

  methods: {
    bindEvents () {
      this.handleMessage = this.handleMessage.bind(this)
      this.resize = debounce(1 / 60, this.resize.bind(this))
      window.addEventListener('resize', this.resize, false)
      this.$electron.ipcRenderer.on('message', this.handleMessage)
    },

    handleMessage (event, data) {
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

    saveFrameImage ({ path, buffer, width, height }) {
      return new Promise((resolve, reject) => {
        logger.time('save frame image')
        const out = createWriteStream(path)
        const img = new PNG({
          width,
          height,
          inputHasAlpha: true
        })

        img.data = buffer
        img.pack().pipe(out)
        out.on('finish', () => {
          resolve(img)
          logger.timeEnd('save frame image')
        })
      })
    },

    resize (event) {
      this.isFullscreen = isFullscreen()
    },

    // NOTE: Hacky way to fix hidden cursor on mouse-enter from palette
    // Maybe there's a better way to do this ... ?
    // FIXME: Should prevent capturing focus from other apps
    mouseEnterMain () {
      if (DEBUG_DISABLE_FOCUS) return
      this.$electron.remote.getCurrentWindow().focus()
    },

    mouseEnterScene () {
      this.hasMouse = true
    },

    mouseLeaveScene () {
      this.hasMouse = false
    },

    // TODO: Hide cursor on mouseleave
    updateCursor (isActive, data) {
      this.cursorIsActive = isActive
      this.cursorData = data
    }
  },

  computed: {
    observeMessage () {
      const { ipcRenderer } = this.$electron
      return ipcRenderer.on.bind(ipcRenderer)
    },

    // TODO: Cleanup intercepting message
    sendMessage () {
      const { ipcRenderer } = this.$electron
      return (name, data) => {
        switch (name) {
          case 'save-frame--response':
            this.saveFrameImage(data).then(() => {
              ipcRenderer.send('save-frame--response', {
                path: data.path
              })
            })
            break
          default:
            ipcRenderer.send(name, data)
            break
        }
      }
    }
  }
}
</script>
