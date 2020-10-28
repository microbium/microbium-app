<template>
  <div class="editor"
    v-on:mouseenter="mouseEnterMain">
    <div class="editor-toolbar" :class="toolbarClassNames">
      <div class="editor-toolbar__draggable"></div>
      <div @click="close" class="editor-toolbar__close"></div>
      <div class="editor-toolbar__title" v-if="fileName && !isFullscreen">
        <span @click.meta="openFileLocation">
          {{ fileName }}
        </span>
      </div>
      <div class="editor-toolbar__tool" v-if="hasControls">
        <editor-quick-tool :model="controls.lineTool"
          :styles="controls.styles"
          :constraints="controls.constraintGroups" />
      </div>
    </div>
    <div class="editor__scene"
      v-on:mouseenter="mouseEnterScene"
      v-on:mouseleave="mouseLeaveScene">
      <editor-compositor
        :observeMessage="observeMessage"
        :sendMessage="sendMessage"
        :updateControls="updateControls"
        :updateCursor="updateCursor" />
      <editor-cursor v-if="cursorIsActive"
        :visible="hasMouse"
        :model="cursorData" />
    </div>
  </div>
</template>

<style lang="scss">
.editor {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  overflow: hidden;
  width: 100%;
  height: 100%;
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
  transition: opacity 200ms;

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
    margin: 3px auto;
    padding: 11px 0;
    width: 240px;

    color: rgba(49,64,68,0.95);
    font-size: #{(14 / 13)}em;
    text-align: center;
    cursor: default;
  }

  &__tool {
    position: absolute;
    top: 0;
    left: 50px;

    -webkit-app-region: no-drag;
  }

  &__close {
    position: absolute;
    top: 12px;
    left: 12px;
    background: #fff;
    width: 13px;
    height: 13px;
    border: 1px solid #444;
    border-radius: 50%;
    -webkit-app-region: no-drag;

    &:before {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      border-radius: 50%;
      background: #222;
      width: 5px;
      height: 5px;
      opacity: 0;
      transition: opacity 100ms;
    }

    &:hover {
      background: #aaa;
    }
  }

  &.hidden {
    opacity: 0;
  }

  &.edited & {
    &__close:before {
      opacity: 1;
    }
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
import EditorQuickTool from './editor/QuickTool'

const DEBUG_DISABLE_FOCUS = true

export default {
  name: 'editor',

  components: {
    EditorCompositor,
    EditorCursor,
    EditorQuickTool
  },

  data () {
    return {
      fileName: null,
      fileFullPath: null,
      isFullscreen: false,
      hasMouse: false,
      cursorIsActive: false,
      cursorData: null,
      hasControls: false,
      controls: null,
      toolbarIsHidden: false,
      sceneIsEdited: false
    }
  },

  created () {
    this._isSettingUp = true
    setTimeout(() => {
      this._isSettingUp = false
    }, 1)

    this.bindEvents()
    this.resize()
  },

  methods: {
    bindEvents () {
      const { ipcRenderer } = this.$electron

      this.handleMessage = this.handleMessage.bind(this)
      this.handleCommand = this.handleCommand.bind(this)
      this.resize = debounce(1 / 60, this.resize.bind(this))

      window.addEventListener('resize', this.resize, false)
      ipcRenderer.on('message', this.handleMessage)
      ipcRenderer.on('command', this.handleCommand)
    },

    // TODO: Cleanup `message` vs `command`
    handleMessage (event, data) {
      switch (data.type) {
        case 'UPDATE_FILE_PATH':
          this.updateFilePath(data)
          break
        case 'SET_EDITED':
          this.sceneIsEdited = data.isEdited
          break
      }
    },

    handleCommand (event, data) {
      switch (data.action) {
        case 'EDITOR_TOGGLE_TOOLBAR':
          this.toolbarIsHidden = !this.toolbarIsHidden
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

    updateControls (controls) {
      this.hasControls = true
      this.controls = controls
    },

    // TODO: Hide cursor on mouseleave
    updateCursor (isActive, data) {
      this.cursorIsActive = isActive
      this.cursorData = data
    },

    close () {
      this.sendMessage('close-window', { name: 'main' })
    },

    // OPTIM: Improve syncing controls
    syncControls (group, value) {
      console.log('syncControls', this.controls._paletteDidUpdate, this._isSettingUp)
      if (this.controls._paletteDidUpdate || this._isSettingUp) return
      const target = this._menuDidUpdateControls ? 'palette' : 'palette+menu'
      this.sendMessage(`${target}-message`, {
        type: 'UPDATE_CONTROLS',
        group,
        value
      })
    }
  },

  computed: {
    toolbarClassNames () {
      const { toolbarIsHidden, sceneIsEdited, isFullscreen } = this
      return {
        hidden: toolbarIsHidden || isFullscreen,
        edited: sceneIsEdited
      }
    },

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
  },

  watch: {
    'controls.lineTool.styleIndex': createStateSyncer('lineTool'),
    'controls.lineTool.constraintIndex': createStateSyncer('lineTool')
  }
}

// OPTIM: Make sycing watchers more granular
function createStateSyncer (name) {
  return {
    deep: true,
    handler () {
      const value = this.controls[name]
      this.syncControls(name, value)
    }
  }
}
</script>
